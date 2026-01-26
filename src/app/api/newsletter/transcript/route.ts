import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import https from "https";

// Alternative method: Fetch transcript directly from YouTube page
async function fetchTranscriptFromPage(videoId: string): Promise<string | null> {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    
    // Try multiple patterns to find transcript data
    // YouTube stores transcript data in different JSON structures
    let captionTracks: any[] | null = null;
    
    // Pattern 1: Look for captionTracks in ytInitialPlayerResponse
    const playerResponseMatch = html.match(/"captionTracks":(\[[^\]]+\])/);
    if (playerResponseMatch) {
      try {
        captionTracks = JSON.parse(playerResponseMatch[1]);
      } catch (e) {
        // Try pattern 2
      }
    }
    
    // Pattern 2: Look for captionTracks in a larger JSON structure
    if (!captionTracks) {
      const jsonMatch = html.match(/"captionTracks":\s*(\[[\s\S]*?\](?=\s*[,}]))/);
      if (jsonMatch) {
        try {
          captionTracks = JSON.parse(jsonMatch[1]);
        } catch (e) {
          // Try pattern 3
        }
      }
    }
    
    // Pattern 3: Look for ytInitialPlayerResponse and extract captionTracks from it
    if (!captionTracks) {
      const ytInitialMatch = html.match(/"ytInitialPlayerResponse":\s*({[\s\S]*?})(?=\s*[,}])/);
      if (ytInitialMatch) {
        try {
          const playerResponse = JSON.parse(ytInitialMatch[1]);
          captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || null;
        } catch (e) {
          console.error('Error parsing ytInitialPlayerResponse:', e);
        }
      }
    }
    
    if (captionTracks && captionTracks.length > 0) {
      try {
        // Find French track
        const frenchTrack = captionTracks.find((track: any) => 
          track.languageCode === 'fr' || 
          track.languageCode === 'fr-FR' ||
          track.languageCode?.startsWith('fr')
        );
        const track = frenchTrack || captionTracks.find((track: any) => track.languageCode === 'en') || captionTracks[0];
        
        if (track && track.baseUrl) {
          // Fetch the actual transcript XML
          const transcriptResponse = await fetch(track.baseUrl);
          if (!transcriptResponse.ok) {
            return null;
          }
          const transcriptXml = await transcriptResponse.text();
          
          // Parse XML to extract text (handle both <text> tags and other formats)
          const textMatches = transcriptXml.match(/<text[^>]*>([^<]+)<\/text>/g) || 
                             transcriptXml.match(/<text[^>]*\/>/g);
          if (textMatches && textMatches.length > 0) {
            const transcript = textMatches
              .map(match => {
                // Extract text content, handling both <text>content</text> and <text attr="value"/>
                const contentMatch = match.match(/>([^<]+)</);
                return contentMatch ? contentMatch[1].trim() : '';
              })
              .filter(text => text.length > 0)
              .join(' ');
            
            if (transcript.length > 0) {
              return transcript;
            }
          }
        }
      } catch (e) {
        console.error('Error processing caption track:', e);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching transcript from page:', error);
    return null;
  }
}

/**
 * Fetches YouTube video transcription
 * Usage: GET /api/newsletter/transcript?videoId=VIDEO_ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId parameter is required" },
        { status: 400 }
      );
    }

    // Check if captions exist using YouTube Data API (best-effort)
    const apiKey = process.env.YOUTUBE_API_KEY;
    let captionsAvailable = false;
    if (apiKey) {
      try {
        const captionsUrl = `https://www.googleapis.com/youtube/v3/captions?key=${apiKey}&videoId=${encodeURIComponent(videoId)}&part=snippet`;
        const captionsRes = await fetch(captionsUrl, { cache: "no-store" });
        if (captionsRes.ok) {
          const captionsData: any = await captionsRes.json();
          captionsAvailable = Array.isArray(captionsData?.items) && captionsData.items.length > 0;
        }
      } catch {
        // Ignore API check errors, continue with transcript fetch
      }
    }

    let transcriptItems: any[] | undefined;
    let language = "unknown";

    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: "fr" });
      language = "fr";
    } catch (frError) {
      try {
        transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
        language = "en";
      } catch (enError) {
        try {
          transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
          language = transcriptItems?.[0]?.lang || "auto";
        } catch (autoError) {
          console.error("All transcript fetch attempts failed:", {
            frError: frError instanceof Error ? frError.message : String(frError),
            enError: enError instanceof Error ? enError.message : String(enError),
            autoError: autoError instanceof Error ? autoError.message : String(autoError),
          });

          // Fallback: page scraping
          console.log("youtube-transcript failed, trying alternative page-scraping method...");
          const pageTranscript = await fetchTranscriptFromPage(videoId);
          if (pageTranscript && pageTranscript.length > 0) {
            return NextResponse.json({
              videoId,
              transcript: pageTranscript,
              language: "fr",
              length: pageTranscript.length,
              method: "page-scraping",
            });
          }

          if (captionsAvailable) {
            throw new Error(
              "Captions exist but cannot be accessed via API or page scraping. Try again later."
            );
          }

          throw new Error(
            `Impossible de récupérer la transcription. Vérifiez que les sous-titres sont activés ET PUBLIÉS pour cette vidéo. Erreur: ${
              frError instanceof Error ? frError.message : String(frError)
            }`
          );
        }
      }
    }

    const fullTranscript = (transcriptItems || []).map((item: any) => item.text).join(" ");
    if (!fullTranscript || fullTranscript.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Transcript is empty",
          note: "The video may not have captions enabled or the transcript is not available",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      videoId,
      transcript: fullTranscript,
      segments: transcriptItems,
      language,
      length: fullTranscript.length,
    });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: "Failed to fetch transcript",
        details: errorMessage,
        note: "IMPORTANT: Captions must be PUBLISHED, not just enabled. In YouTube Studio: Go to Videos > Select video > Subtitles > Make sure the caption track shows 'Published' status (not 'Draft'). If it says 'Draft', click 'Publish'.",
      },
      { status: 500 }
    );
  }
}

