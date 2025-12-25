import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
 * Body: { videoId: string, title: string, episodeNumber: number }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoId, title, episodeNumber } = body;

    if (!videoId || !title || episodeNumber === undefined) {
      return NextResponse.json(
        { error: "videoId, title, and episodeNumber are required" },
        { status: 400 }
      );
    }

    // First, fetch the transcript
    // Try multiple methods to get the transcript
    let transcript = "";
    let transcriptError = "";

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

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Could not fetch transcript for this video",
          details: transcriptError,
          note: "Please ensure the video has captions enabled in YouTube Studio. You can enable auto-generated captions.",
          suggestion: "Go to YouTube Studio > Videos > Select video > Subtitles > Add language > Auto-generate",
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

    return NextResponse.json({
      success: true,
      episodeNumber,
      summary,
      message: "Summary generated and saved successfully",
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

