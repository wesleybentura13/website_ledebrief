import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

/**
 * Fetches YouTube video transcription
 * Usage: GET /api/newsletter/transcript?videoId=VIDEO_ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId parameter is required" },
        { status: 400 }
      );
    }

    let transcriptItems;
    let language = "unknown";

    // Try to fetch transcript with different language options
    try {
      // Try French first
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: "fr",
      });
      language = "fr";
    } catch (frError) {
      try {
        // Try English
        transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: "en",
        });
        language = "en";
      } catch (enError) {
        try {
          // Try without specifying language (auto-detect)
          transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
          language = transcriptItems[0]?.lang || "auto";
        } catch (autoError) {
          console.error("All transcript fetch attempts failed:", {
            frError: frError instanceof Error ? frError.message : String(frError),
            enError: enError instanceof Error ? enError.message : String(enError),
            autoError: autoError instanceof Error ? autoError.message : String(autoError),
          });
          throw new Error(
            `Impossible de récupérer la transcription. Vérifiez que les sous-titres sont activés pour cette vidéo. Erreurs: ${frError instanceof Error ? frError.message : String(frError)}`
          );
        }
      }
    }

    // Combine all transcript items into full text
    const fullTranscript = transcriptItems
      .map((item) => item.text)
      .join(" ");

    if (!fullTranscript || fullTranscript.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Transcript is empty",
          note: "The video may not have captions enabled or the transcript is not available",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      videoId,
      transcript: fullTranscript,
      segments: transcriptItems,
      language,
      length: fullTranscript.length,
    });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch transcript",
        details: error instanceof Error ? error.message : String(error),
        note: "Make sure the video has captions enabled. You can enable auto-generated captions in YouTube Studio.",
      },
      { status: 500 }
    );
  }
}

