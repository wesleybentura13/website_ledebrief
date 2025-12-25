import { NextResponse } from "next/server";
import https from "https";

/**
 * Alternative method to fetch YouTube captions using YouTube Data API v3
 * This requires the video to have captions and uses the YouTube Data API
 * Usage: GET /api/newsletter/transcript-youtube-api?videoId=VIDEO_ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId parameter is required" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "YouTube API key not configured",
          note: "Add YOUTUBE_API_KEY to .env.local to use this method",
        },
        { status: 500 }
      );
    }

    // First, get caption tracks for the video
    const captionsUrl = `https://www.googleapis.com/youtube/v3/captions?key=${apiKey}&videoId=${videoId}&part=snippet`;

    const captionsData: any = await new Promise((resolve, reject) => {
      https.get(captionsUrl, { rejectUnauthorized: false }, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk.toString();
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on("error", reject);
    });

    if (!captionsData.items || captionsData.items.length === 0) {
      return NextResponse.json(
        {
          error: "No captions found for this video",
          note: "Make sure captions are enabled. You can enable auto-generated captions in YouTube Studio.",
        },
        { status: 400 }
      );
    }

    // Find French caption track, or fallback to first available
    let captionTrack = captionsData.items.find((item: any) => item.snippet.language === "fr");
    if (!captionTrack) {
      captionTrack = captionsData.items.find((item: any) => item.snippet.language === "en");
    }
    if (!captionTrack) {
      captionTrack = captionsData.items[0];
    }

    const captionId = captionTrack.id;
    const language = captionTrack.snippet.language;

    // Download the caption track
    // Note: This requires OAuth for private captions, but public captions can be downloaded
    // For now, we'll return the caption track info and suggest using youtube-transcript
    return NextResponse.json({
      videoId,
      captionId,
      language,
      captionTracks: captionsData.items.map((item: any) => ({
        id: item.id,
        language: item.snippet.language,
        name: item.snippet.name,
      })),
      note: "Caption tracks found. Use youtube-transcript package or download captions manually.",
    });
  } catch (error) {
    console.error("Error fetching captions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch captions",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

