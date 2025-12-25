import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

/**
 * Fetches YouTube channel videos
 * Usage: GET /api/youtube-episodes?channelId=CHANNEL_ID
 * 
 * To find channel ID:
 * 1. Go to https://www.youtube.com/@ledebrief_podcast
 * 2. View page source
 * 3. Search for "channelId" - it will look like: "channelId":"UC..."
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return NextResponse.json(
        { error: "channelId parameter is required" },
        { status: 400 }
      );
    }

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const feed = await parser.parseURL(feedUrl);

    const videos = feed.items.map((item) => {
      // Extract video ID from YouTube video URL
      const videoIdMatch = item.link?.match(/[?&]v=([^&]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : "";

      // Extract thumbnail URL
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      return {
        id: videoId,
        title: item.title || "",
        publishedAt: item.pubDate || "",
        thumbnail: thumbnailUrl,
        description: item.contentSnippet || item.content || "",
        link: item.link || "",
      };
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Error fetching YouTube episodes:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube videos", details: String(error) },
      { status: 500 }
    );
  }
}


