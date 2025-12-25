import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

/**
 * Fetches YouTube channel videos using channel handle
 * For modern YouTube channels with @handle, use: https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
 * 
 * This endpoint tries to fetch using the handle, but channel ID is more reliable
 * Usage: GET /api/youtube-channel?handle=ledebrief_podcast
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle") || "ledebrief_podcast";

    // For channels with @handle, try the channel feed format
    // Note: This requires the channel ID, not the handle
    // We'll try a few common patterns, but the user should provide the channel ID
    
    // Try alternative feed URL format for handle-based channels
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?user=${handle}`;
    
    try {
      const feed = await parser.parseURL(feedUrl);
      
      const episodes = feed.items.map((item, index) => {
        const videoIdMatch = item.link?.match(/[?&]v=([^&]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : "";
        const publishedDate = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : "";

        return {
          youtubeId: videoId,
          title: item.title || "",
          date: publishedDate,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          description: item.contentSnippet || item.content || "",
          link: item.link || "",
          slug: item.title
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || `episode-${index + 1}`,
        };
      });

      return NextResponse.json({ 
        episodes,
        count: episodes.length,
        handle 
      });
    } catch (feedError) {
      // The user feed format doesn't work for modern @handle channels
      // We need the channel ID
      return NextResponse.json(
        { 
          error: "Channel ID required",
          message: "Pour récupérer les épisodes, nous avons besoin du Channel ID, pas du handle.",
          instructions: [
            "1. Allez sur https://www.youtube.com/@ledebrief_podcast",
            "2. Faites un clic droit et sélectionnez 'Afficher le code source'",
            "3. Appuyez sur Cmd+F (Mac) ou Ctrl+F (Windows) pour rechercher",
            "4. Cherchez 'channelId'",
            "5. Copiez l'ID (il ressemble à 'UCxxxxxxxxxxxxxxxxxxxxx')",
            "6. Créez un fichier .env.local et ajoutez: NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=VOTRE_ID"
          ],
          note: "Le handle seul ne fonctionne pas avec l'API RSS de YouTube. Le Channel ID est nécessaire."
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching YouTube episodes:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch YouTube videos", 
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

