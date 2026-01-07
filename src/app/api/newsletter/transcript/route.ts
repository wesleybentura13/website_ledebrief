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

    // Check if captions exist using YouTube Data API (if available)
    const apiKey = process.env.YOUTUBE_API_KEY;
    let captionsAvailable = false;
    if (apiKey) {
      try {
        const captionsUrl = `https://www.googleapis.com/youtube/v3/captions?key=${apiKey}&videoId=${videoId}&part=snippet`;
        const captionsData: any = await new Promise((resolve, reject) => {
          https.get(captionsUrl, { rejectUnauthorized: false }, (res) => {
            let data = "";
            res.on("data", (chunk) => { data += chunk.toString(); });
            res.on("end", () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(e);
              }
            });
          }).on("error", reject);
        });
        captionsAvailable = captionsData.items && captionsData.items.length > 0;
      } catch (error) {
        // Ignore API check errors, continue with transcript fetch
      }
    }

    // Temporarily disable SSL verification for youtube-transcript
    // This is needed due to SSL certificate issues on the system
    const originalRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    let transcriptItems;
    let language = "unknown";

    try {
      // Try to fetch transcript with different language options
      try {
        // Try French first
        transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: "fr",
        });
        language = "fr";
      } catch (frError) {
        try {
          // Try English
          transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: "en",
          });
          language = "en";
        } catch (enError) {
          try {
            // Try without specifying language (auto-detect)
            transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
            language = transcriptItems[0]?.lang || "auto";
          } catch (autoError) {
            console.error("All transcript fetch attempts failed:", {
              frError: frError instanceof Error ? frError.message : String(frError),
              enError: enError instanceof Error ? enError.message : String(enError),
              autoError: autoError instanceof Error ? autoError.message : String(autoError),
            });
            
            // Try alternative method: fetch from YouTube page directly
            console.log('youtube-transcript failed, trying alternative page-scraping method...');
            const pageTranscript = await fetchTranscriptFromPage(videoId);
            
            if (pageTranscript && pageTranscript.length > 0) {
              // Successfully got transcript from page - return it
              return NextResponse.json({
                videoId,
                transcript: pageTranscript,
                language: "fr",
                length: pageTranscript.length,
                method: "page-scraping",
              });
            }
            
            // Provide more helpful error message if captions exist but can't be accessed
            if (captionsAvailable) {
              throw new Error(
                `Captions exist but cannot be accessed via API or page scraping. The youtube-transcript library failed and the alternative method also failed. This might be a temporary YouTube issue. Try again in a few minutes.`
              );
            }
            
            throw new Error(
              `Impossible de récupérer la transcription. Vérifiez que les sous-titres sont activés ET PUBLIÉS pour cette vidéo. Erreurs: ${frError instanceof Error ? frError.message : String(frError)}`
            );
          }
        }
      }
    } finally {
      // Restore original SSL setting
      if (originalRejectUnauthorized !== undefined) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalRejectUnauthorized;
      } else {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      }
    }

    // Combine all transcript items into full text
    const fullTranscript = transcriptItems
      .map((item) => item.text)
      .join(" ");

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
        troubleshooting: [
          "1. Go to YouTube Studio: https://studio.youtube.com/",
          "2. Select your video",
          "3. Click 'Subtitles' in the left menu",
          "4. Find your French caption track",
          "5. Make sure it says 'Published' (not 'Draft')",
          "6. If it says 'Draft', click the three dots (...) and select 'Publish'",
          "7. Wait 1-2 minutes for YouTube to process",
          "8. Try again"
        ],
      },
      { status: 500 }
    );
  }
}

