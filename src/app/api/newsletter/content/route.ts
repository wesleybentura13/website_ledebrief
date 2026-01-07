import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface NewsletterContent {
  episodeNumber: number;
  youtubeId: string;
  title: string;
  date: string;
  summary: string;
  transcript: string;
  createdAt: string;
}

/**
 * Get newsletter content
 * Shows all summaries except the last 5 episodes (subscriber-only)
 * Usage: GET /api/newsletter/content?subscriber=true (to see all)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isSubscriber = searchParams.get("subscriber") === "true";

    const contentPath = path.join(process.cwd(), "data", "newsletter-content.json");
    
    if (!fs.existsSync(contentPath)) {
      return NextResponse.json({ content: [], publicContent: [] });
    }

    const fileContent = fs.readFileSync(contentPath, "utf-8");
    const allContent: NewsletterContent[] = JSON.parse(fileContent);

    // Sort by episode number (newest first)
    const sortedContent = [...allContent].sort((a, b) => b.episodeNumber - a.episodeNumber);

    if (isSubscriber) {
      // Subscribers see all content
      return NextResponse.json({
        content: sortedContent,
        publicContent: sortedContent,
        isSubscriber: true,
      });
    } else {
      // Public sees all except last 5 episodes
      const publicContent = sortedContent.slice(5);
      return NextResponse.json({
        content: sortedContent,
        publicContent,
        isSubscriber: false,
        lockedCount: Math.min(5, sortedContent.length),
      });
    }
  } catch (error) {
    console.error("Error fetching newsletter content:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch newsletter content",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}


