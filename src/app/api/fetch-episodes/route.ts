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

// Fetch all videos using YouTube Data API v3 (if API key is provided)
async function fetchAllVideosWithAPI(channelId: string, apiKey?: string): Promise<any[] | null> {
  if (!apiKey) return null;

  try {
    let allVideos: any[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&type=video&maxResults=50&order=date${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      
      const apiResponse = await fetch(apiUrl, {
        // @ts-ignore - Node.js fetch doesn't have rejectUnauthorized in options
        agent: new https.Agent({ rejectUnauthorized: false }),
      });
      
      if (!apiResponse.ok) {
        throw new Error(`YouTube API error: ${apiResponse.status}`);
      }

      const apiData: any = await apiResponse.json();
      
      if (apiData.items) {
        allVideos = allVideos.concat(apiData.items);
      }
      
      nextPageToken = apiData.nextPageToken;
    } while (nextPageToken);

    return allVideos.map((item: any) => {
      const videoId = item.id.videoId;
      const publishedDate = item.snippet.publishedAt ? new Date(item.snippet.publishedAt).toISOString().split('T')[0] : "";

      return {
        youtubeId: videoId,
        title: item.snippet.title || "",
        date: publishedDate,
        thumbnailUrl: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        description: item.snippet.description || "",
        link: `https://www.youtube.com/watch?v=${videoId}`,
        slug: item.snippet.title
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `episode-${videoId}`,
      };
    });
  } catch (error) {
    console.error("Error fetching with YouTube API:", error);
    return null;
  }
}

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

    // Try YouTube Data API first if API key is available (gets all videos)
    const apiKey = process.env.YOUTUBE_API_KEY;
    let episodes: any[] = [];

    if (apiKey) {
      const apiVideos = await fetchAllVideosWithAPI(channelId, apiKey);
      if (apiVideos) {
        // Filter out shorts (they're typically less than 60 seconds, but we'll check the URL pattern)
        episodes = apiVideos.filter((ep) => {
          // Regular videos have /watch?v= in the URL, shorts have /shorts/
          return ep.link && !ep.link.includes('/shorts/');
        });
      }
    }

    // Fallback to RSS feed if API key not available or API failed
    if (episodes.length === 0) {
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const feed = await parser.parseURL(feedUrl);

      // Filter out shorts and only keep regular videos
      const regularVideos = feed.items.filter((item) => {
        // Exclude shorts - they have /shorts/ in the URL
        return item.link && !item.link.includes('/shorts/');
      });

      episodes = regularVideos.map((item, index) => {
      // Extract video ID from YouTube video URL (only regular videos now)
      let videoId = "";
      if (item.link) {
        // Try regular video format: ?v=VIDEO_ID
        const regularMatch = item.link.match(/[?&]v=([^&]+)/);
        if (regularMatch) {
          videoId = regularMatch[1];
        } else {
          // Try embed format: /embed/VIDEO_ID
          const embedMatch = item.link.match(/\/embed\/([^/?]+)/);
          if (embedMatch) {
            videoId = embedMatch[1];
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
    }

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


