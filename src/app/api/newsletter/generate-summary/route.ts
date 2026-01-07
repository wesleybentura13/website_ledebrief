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
 * Generates a summary from a transcription using OpenAI
 * Usage: POST /api/newsletter/generate-summary
 * Body: { videoId: string, title: string, episodeNumber: number, transcript?: string }
 * 
 * If transcript is provided, it will be used directly. Otherwise, the API will try to fetch it.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoId, title, episodeNumber, transcript: providedTranscript } = body;

    if (!videoId || !title || episodeNumber === undefined) {
      return NextResponse.json(
        { error: "videoId, title, and episodeNumber are required" },
        { status: 400 }
      );
    }

    // Use provided transcript if available, otherwise fetch it
    let transcript = providedTranscript || "";
    let transcriptError = "";

    // If no transcript provided, try to fetch it
    if (!transcript || transcript.trim().length === 0) {
      try {
        const baseUrl = request.url.split("/api")[0];
        const transcriptResponse = await fetch(
          `${baseUrl}/api/newsletter/transcript?videoId=${videoId}`,
          {
            // Add timeout
            signal: AbortSignal.timeout(30000), // 30 second timeout
          }
        );
        const transcriptData = await transcriptResponse.json();

        if (transcriptData.transcript) {
          transcript = transcriptData.transcript;
        } else {
          transcriptError = transcriptData.error || "No transcript available";
        }
      } catch (error) {
        transcriptError = error instanceof Error ? error.message : String(error);
        console.error("Error fetching transcript:", error);
      }
    }

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Could not fetch transcript for this video",
          details: transcriptError,
          note: "You can provide the transcript manually by including it in the request body: { ..., transcript: 'your transcript text here' }",
          suggestion: "Either ensure the video has captions enabled in YouTube Studio, or download the transcript manually and include it in the API request.",
        },
        { status: 400 }
      );
    }

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

    const summaryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Tu es un expert en résumé de contenu podcast. Crée un résumé concis, engageant et structuré en français du contenu suivant. Le résumé doit être entre 200-300 mots et mettre en avant les points clés de manière claire.",
          },
          {
            role: "user",
            content: `Résume ce podcast en français de manière engageante:\n\n${transcript.substring(0, 10000)}`, // Limit to first 10k chars
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!summaryResponse.ok) {
      const errorData = await summaryResponse.json();
      return NextResponse.json(
        {
          error: "Failed to generate summary",
          details: errorData,
        },
        { status: 500 }
      );
    }

    const summaryData = await summaryResponse.json();
    const summary = summaryData.choices[0]?.message?.content || "Résumé non disponible";

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
      transcript: transcript.substring(0, 5000), // Store first 5k chars
      createdAt: new Date().toISOString(),
    };

    // Remove existing entry for this episode if it exists
    newsletterContent = newsletterContent.filter((item) => item.episodeNumber !== episodeNumber);
    newsletterContent.push(newContent);

    // Sort by episode number (newest first)
    newsletterContent.sort((a, b) => b.episodeNumber - a.episodeNumber);

    fs.writeFileSync(contentPath, JSON.stringify(newsletterContent, null, 2));

    // Send newsletter emails to all subscribers
    let emailResult = { sent: 0, failed: 0 };
    try {
      emailResult = await sendNewsletterEmail(newContent);
      console.log(`[newsletter] Emails sent: ${emailResult.sent}, failed: ${emailResult.failed}`);
    } catch (error) {
      console.error("[newsletter] Error sending emails:", error);
      // Don't fail the whole request if email sending fails
    }

    return NextResponse.json({
      success: true,
      episodeNumber,
      summary,
      message: "Summary generated and saved successfully",
      emails: {
        sent: emailResult.sent,
        failed: emailResult.failed,
      },
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      {
        error: "Failed to generate summary",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

