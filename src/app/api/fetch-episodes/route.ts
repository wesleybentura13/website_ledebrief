import { NextResponse } from "next/server";
import Parser from "rss-parser";
import https from "https";

// Configure parser to handle SSL issues
const parser = new Parser({
  customFields: {
    item: [],
  },
  requestOptions: {
    rejectUnauthorized: false, // Allow self-signed certificates (for development)
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  },
});

/**
 * Fetches YouTube channel videos and returns them in the same order as YouTube
 * 
 * To use this:
 * 1. Find your channel ID by going to https://www.youtube.com/@ledebrief_podcast
 * 2. View page source and search for "channelId" - it will look like: "channelId":"UC..."
 * 3. Call this endpoint: GET /api/fetch-episodes?channelId=YOUR_CHANNEL_ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return NextResponse.json(
        { 
          error: "channelId parameter is required",
          instructions: "To find your channel ID: 1) Go to https://www.youtube.com/@ledebrief_podcast, 2) View page source, 3) Search for 'channelId'"
        },
        { status: 400 }
      );
    }

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const feed = await parser.parseURL(feedUrl);

    const episodes = feed.items.map((item, index) => {
      // Extract video ID from YouTube video URL (handles both regular videos and shorts)
      let videoId = "";
      if (item.link) {
        // Try regular video format: ?v=VIDEO_ID
        const regularMatch = item.link.match(/[?&]v=([^&]+)/);
        if (regularMatch) {
          videoId = regularMatch[1];
        } else {
          // Try shorts format: /shorts/VIDEO_ID
          const shortsMatch = item.link.match(/\/shorts\/([^/?]+)/);
          if (shortsMatch) {
            videoId = shortsMatch[1];
          } else {
            // Try embed format: /embed/VIDEO_ID
            const embedMatch = item.link.match(/\/embed\/([^/?]+)/);
            if (embedMatch) {
              videoId = embedMatch[1];
            }
          }
        }
      }

      // Extract date
      const publishedDate = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : "";

      return {
        youtubeId: videoId,
        title: item.title || "",
        date: publishedDate,
        thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "",
        description: item.contentSnippet || item.content || "",
        link: item.link || "",
        // Generate a slug from title
        slug: item.title
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `episode-${index + 1}`,
      };
    });

    return NextResponse.json({ 
      episodes,
      count: episodes.length,
      channelId 
    });
  } catch (error) {
    console.error("Error fetching YouTube episodes:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch YouTube videos", 
        details: error instanceof Error ? error.message : String(error),
        note: "Make sure the channel ID is correct and the channel has public videos"
      },
      { status: 500 }
    );
  }
}


