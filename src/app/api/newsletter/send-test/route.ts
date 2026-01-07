import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendNewsletterEmail } from "@/lib/email";

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
 * Test endpoint to send newsletter for a specific episode
 * Usage: POST /api/newsletter/send-test
 * Body: { episodeNumber: number } (optional - defaults to latest episode)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { episodeNumber } = body;

    // Load newsletter content
    const contentPath = path.join(process.cwd(), "data", "newsletter-content.json");
    if (!fs.existsSync(contentPath)) {
      return NextResponse.json(
        { error: "No newsletter content found" },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(contentPath, "utf-8");
    const newsletterContent: NewsletterContent[] = JSON.parse(fileContent);

    if (newsletterContent.length === 0) {
      return NextResponse.json(
        { error: "No episodes found in newsletter content" },
        { status: 404 }
      );
    }

    // Find the episode to send
    let episode: NewsletterContent | undefined;
    if (episodeNumber) {
      episode = newsletterContent.find((item) => item.episodeNumber === episodeNumber);
      if (!episode) {
        return NextResponse.json(
          { error: `Episode #${episodeNumber} not found` },
          { status: 404 }
        );
      }
    } else {
      // Default to latest episode
      episode = newsletterContent[0];
    }

    // Send newsletter emails
    let emailResult = { sent: 0, failed: 0 };
    let errorDetails: any = null;
    
    try {
      emailResult = await sendNewsletterEmail(episode);
    } catch (error) {
      errorDetails = error instanceof Error ? error.message : String(error);
      console.error("[send-test] Error:", error);
      // If error occurred, mark as failed
      emailResult.failed = 1;
    }

    return NextResponse.json({
      success: emailResult.failed === 0,
      episode: {
        number: episode.episodeNumber,
        title: episode.title,
      },
      emails: {
        sent: emailResult.sent,
        failed: emailResult.failed,
      },
      message: emailResult.failed === 0 
        ? `Newsletter sent successfully! ${emailResult.sent} email(s) sent.`
        : `Failed to send newsletter. ${emailResult.sent} sent, ${emailResult.failed} failed.`,
      error: errorDetails,
    });
  } catch (error) {
    console.error("Error sending test newsletter:", error);
    return NextResponse.json(
      {
        error: "Failed to send newsletter",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

