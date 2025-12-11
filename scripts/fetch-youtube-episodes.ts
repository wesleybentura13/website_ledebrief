import Parser from "rss-parser";

const parser = new Parser();

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
}

/**
 * Fetches YouTube channel videos from RSS feed
 * Note: You need the channel ID, not the handle
 * To find channel ID: https://www.youtube.com/@ledebrief_podcast -> View page source -> search for "channelId"
 */
async function fetchYouTubeEpisodes(channelId: string): Promise<YouTubeVideo[]> {
  try {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const feed = await parser.parseURL(feedUrl);

    const videos: YouTubeVideo[] = feed.items.map((item) => {
      // Extract video ID from YouTube video URL
      const videoIdMatch = item.link?.match(/[?&]v=([^&]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : "";

      // Extract thumbnail URL
      const thumbnailUrl = item.contentSnippet
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : "";

      return {
        id: videoId,
        title: item.title || "",
        publishedAt: item.pubDate || "",
        thumbnail: thumbnailUrl,
        description: item.contentSnippet || item.content || "",
      };
    });

    return videos;
  } catch (error) {
    console.error("Error fetching YouTube episodes:", error);
    throw error;
  }
}

// Example usage (uncomment and add your channel ID):
// const CHANNEL_ID = "YOUR_CHANNEL_ID_HERE";
// fetchYouTubeEpisodes(CHANNEL_ID).then((videos) => {
//   console.log("Fetched videos:", videos);
// });

export { fetchYouTubeEpisodes };

