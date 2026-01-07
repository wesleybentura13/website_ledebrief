import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendNewsletterEmail } from "@/lib/email";

interface NewsletterContent {
  episodeNumber: number;
  youtubeId: string;
  title: string;
  date: string;
  summary: string;
  transcript: string;
  createdAt: string;
}

/**
 * Automated endpoint to process an episode transcript
 * This endpoint:
 * 1. Accepts transcript and episode details
 * 2. Generates AI summary
 * 3. Saves to newsletter content
 * 4. Sends emails to all subscribers
 * 
 * Usage: POST /api/newsletter/process-episode
 * Body: {
 *   videoId: string,
 *   title: string,
 *   episodeNumber: number,
 *   transcript: string
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoId, title, episodeNumber, transcript } = body;

    // Validate required fields
    if (!videoId || !title || episodeNumber === undefined || !transcript) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["videoId", "title", "episodeNumber", "transcript"],
          received: {
            videoId: !!videoId,
            title: !!title,
            episodeNumber: episodeNumber !== undefined,
            transcript: !!transcript,
          },
        },
        { status: 400 }
      );
    }

    // Clean transcript (remove timestamps if present)
    let cleanedTranscript = transcript.trim();
    
    // Generate summary using OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          note: "Add OPENAI_API_KEY to .env.local",
        },
        { status: 500 }
      );
    }

    console.log(`[process-episode] Generating summary for episode #${episodeNumber}...`);

    // Use https module to avoid SSL issues
    const https = require("https");
    const openaiPayload = JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en résumé de contenu podcast. Crée un résumé concis, engageant et structuré en français du contenu suivant. Le résumé doit être entre 200-300 mots et mettre en avant les points clés de manière claire.",
        },
        {
          role: "user",
          content: `Résume ce podcast en français de manière engageante:\n\n${cleanedTranscript.substring(0, 10000)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const summaryData: any = await new Promise((resolve, reject) => {
      const options = {
        hostname: "api.openai.com",
        port: 443,
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Length": Buffer.byteLength(openaiPayload),
        },
        rejectUnauthorized: false,
      };

      const req = https.request(options, (res: any) => {
        let data = "";
        res.on("data", (chunk: Buffer) => {
          data += chunk.toString();
        });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`OpenAI API error: ${JSON.stringify(parsed)}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse OpenAI response: ${data}`));
          }
        });
      });

      req.on("error", reject);
      req.write(openaiPayload);
      req.end();
    });

    const summary = summaryData.choices[0]?.message?.content || "Résumé non disponible";

    console.log(`[process-episode] Summary generated successfully`);

    // Save to newsletter content file
    const contentPath = path.join(process.cwd(), "data", "newsletter-content.json");
    let newsletterContent: NewsletterContent[] = [];

    if (fs.existsSync(contentPath)) {
      const fileContent = fs.readFileSync(contentPath, "utf-8");
      newsletterContent = JSON.parse(fileContent);
    }

    const newContent: NewsletterContent = {
      episodeNumber,
      youtubeId: videoId,
      title,
      date: new Date().toISOString().split("T")[0],
      summary,
      transcript: cleanedTranscript.substring(0, 5000), // Store first 5k chars
      createdAt: new Date().toISOString(),
    };

    // Remove existing entry for this episode if it exists
    newsletterContent = newsletterContent.filter((item) => item.episodeNumber !== episodeNumber);
    newsletterContent.push(newContent);

    // Sort by episode number (newest first)
    newsletterContent.sort((a, b) => b.episodeNumber - a.episodeNumber);

    fs.writeFileSync(contentPath, JSON.stringify(newsletterContent, null, 2));

    console.log(`[process-episode] Episode saved to newsletter content`);

    // Send newsletter emails to all subscribers
    let emailResult = { sent: 0, failed: 0 };
    try {
      console.log(`[process-episode] Sending emails to subscribers...`);
      emailResult = await sendNewsletterEmail(newContent);
      console.log(`[process-episode] Emails sent: ${emailResult.sent}, failed: ${emailResult.failed}`);
    } catch (error) {
      console.error("[process-episode] Error sending emails:", error);
      // Don't fail the whole request if email sending fails
    }

    return NextResponse.json({
      success: true,
      episode: {
        number: episodeNumber,
        title,
        videoId,
      },
      summary,
      emails: {
        sent: emailResult.sent,
        failed: emailResult.failed,
      },
      message: `Episode processed successfully! Summary generated and ${emailResult.sent} email(s) sent to subscribers.`,
    });
  } catch (error) {
    console.error("Error processing episode:", error);
    return NextResponse.json(
      {
        error: "Failed to process episode",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

