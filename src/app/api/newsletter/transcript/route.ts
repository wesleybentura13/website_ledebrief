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

    // Fetch transcript from YouTube
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "fr", // Try French first
    }).catch(async () => {
      // Fallback to English if French not available
      return YoutubeTranscript.fetchTranscript(videoId);
    });

    // Combine all transcript items into full text
    const fullTranscript = transcriptItems
      .map((item) => item.text)
      .join(" ");

    return NextResponse.json({
      videoId,
      transcript: fullTranscript,
      segments: transcriptItems,
      language: transcriptItems[0]?.lang || "unknown",
    });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch transcript",
        details: error instanceof Error ? error.message : String(error),
        note: "Make sure the video has captions enabled and the videoId is correct",
      },
      { status: 500 }
    );
  }
}

