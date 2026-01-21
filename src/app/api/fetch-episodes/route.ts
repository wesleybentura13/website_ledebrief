import { NextResponse } from "next/server";
import Parser from "rss-parser";
import https from "https";

// Parse YouTube duration format (PT1M30S) to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Decode HTML entities in text
function decodeHtmlEntities(text: string): string {
  if (!text) return text;
  
  // Common HTML entities mapping
  const entities: { [key: string]: string } = {
    '&#39;': "'",
    '&apos;': "'",
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&#8217;': "'",
    '&#8216;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
  };
  
  let decoded = text;
  // Replace numeric entities like &#39;
  decoded = decoded.replace(/&#(\d+);/g, (match, num) => {
    return String.fromCharCode(parseInt(num, 10));
  });
  
  // Replace named entities
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }
  
  return decoded;
}

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
      
      // Use https module directly to handle SSL issues
      const apiData: any = await new Promise((resolve, reject) => {
        https.get(apiUrl, { rejectUnauthorized: false }, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });
      
      if (apiData.error) {
        console.error('YouTube API returned error:', apiData.error);
        throw new Error(`YouTube API error: ${apiData.error.message || JSON.stringify(apiData.error)}`);
      }
      
      if (apiData.items) {
        allVideos = allVideos.concat(apiData.items);
      }
      
      nextPageToken = apiData.nextPageToken;
    } while (nextPageToken);

    // Get video details (including duration and statistics like view count)
    // Batch requests (max 50 video IDs per request)
    const allVideoIds = allVideos.map((item: any) => item.id.videoId);
    const durationMap: { [key: string]: number } = {};
    const statisticsMap: { [key: string]: any } = {};
    
    // Process in batches of 50
    for (let i = 0; i < allVideoIds.length; i += 50) {
      const batch = allVideoIds.slice(i, i + 50);
      const videoIds = batch.join(',');
      // Include both contentDetails (for duration) and statistics (for view count)
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=contentDetails,statistics`;
      
      try {
        const videoDetails: any = await new Promise((resolve, reject) => {
          https.get(detailsUrl, { rejectUnauthorized: false }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(e);
              }
            });
          }).on('error', reject);
        });

        if (videoDetails.items) {
          videoDetails.items.forEach((item: any) => {
            const duration = parseDuration(item.contentDetails.duration);
            durationMap[item.id] = duration;
            // Store statistics (view count, etc.)
            statisticsMap[item.id] = item.statistics || {};
          });
        }
      } catch (error) {
        console.error(`Error fetching video details for batch ${i}:`, error);
      }
    }

    return allVideos
      .map((item: any) => {
        const videoId = item.id.videoId;
        const publishedDate = item.snippet.publishedAt ? new Date(item.snippet.publishedAt).toISOString().split('T')[0] : "";
        const duration = durationMap[videoId] || 0;

        const rawTitle = item.snippet.title || "";
        const decodedTitle = decodeHtmlEntities(rawTitle);
        
        const stats = statisticsMap[videoId] || {};
        const viewCount = stats.viewCount ? parseInt(stats.viewCount, 10) : 0;

        return {
          youtubeId: videoId,
          title: decodedTitle,
          date: publishedDate,
          thumbnailUrl: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          description: decodeHtmlEntities(item.snippet.description || ""),
          link: `https://www.youtube.com/watch?v=${videoId}`,
          duration: duration,
          viewCount: viewCount,
          slug: decodedTitle
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || `episode-${videoId}`,
        };
      })
      .filter((video: any) => {
        // Filter: only keep videos that start with '#' followed by a number
        // Pattern: # followed by digits (e.g., "#34-", "#1-", etc.)
        const titleMatch = video.title.match(/^#\d+/);
        return titleMatch !== null;
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
    // Check both YOUTUBE_API_KEY and NEXT_PUBLIC_YOUTUBE_API_KEY for compatibility
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    let episodes: any[] = [];

    if (apiKey) {
      console.log('Using YouTube Data API v3 to fetch all videos...');
      try {
        const apiVideos = await fetchAllVideosWithAPI(channelId, apiKey);
        if (apiVideos && apiVideos.length > 0) {
          console.log(`Fetched ${apiVideos.length} videos from YouTube API (already filtered by duration >= 60s)`);
          episodes = apiVideos;
          console.log(`Total regular videos (>= 60 seconds): ${episodes.length}`);
        } else {
          console.log('YouTube API returned no videos, falling back to RSS feed');
        }
      } catch (apiError) {
        console.error('Error using YouTube API, falling back to RSS:', apiError);
      }
    } else {
      console.log('No YouTube API key found in env vars, using RSS feed (limited to 15 videos)');
      console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('YOUTUBE')));
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

      episodes = regularVideos
        .map((item, index) => {
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

          const rawTitle = item.title || "";
          const decodedTitle = decodeHtmlEntities(rawTitle);

          return {
            youtubeId: videoId,
            title: decodedTitle,
            date: publishedDate,
            thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "",
            description: decodeHtmlEntities(item.contentSnippet || item.content || ""),
            link: item.link || "",
            // Generate a slug from title
            slug: decodedTitle
              ?.toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "") || `episode-${index + 1}`,
          };
        })
        .filter((video: any) => {
          // Filter: only keep videos that start with '#' followed by a number
          // Pattern: # followed by digits (e.g., "#34-", "#1-", etc.)
          // This matches the same filter used in the API method
          const titleMatch = video.title.match(/^#\d+/);
          return titleMatch !== null;
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


