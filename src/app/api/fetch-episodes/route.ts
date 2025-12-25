import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

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
      // Extract video ID from YouTube video URL
      const videoIdMatch = item.link?.match(/[?&]v=([^&]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : "";

      // Extract date
      const publishedDate = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : "";

      return {
        youtubeId: videoId,
        title: item.title || "",
        date: publishedDate,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
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


