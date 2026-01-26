import { NextResponse } from "next/server";

/**
 * AUTO-SEND NEWSLETTER API
 * 
 * This endpoint checks for new YouTube episodes and automatically:
 * 1. Detects new episodes
 * 2. Fetches transcript
 * 3. Generates teaser with OpenAI
 * 4. Sends newsletter to all Brevo subscribers
 * 
 * Call this endpoint via a cron job (e.g., every hour)
 */

export async function POST(request: Request) {
  try {
    // Security: Check for a secret token to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const CRON_SECRET = process.env.CRON_SECRET;

    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[Auto Newsletter] Starting check for new episodes...");

    // Step 1: Fetch latest episodes from YouTube
    const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;
    if (!CHANNEL_ID) {
      return NextResponse.json(
        { ok: false, error: "YouTube channel ID not configured" },
        { status: 500 }
      );
    }

    const episodesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/fetch-episodes?channelId=${CHANNEL_ID}`,
      { cache: "no-store" }
    );

    if (!episodesResponse.ok) {
      throw new Error("Failed to fetch episodes");
    }

    const episodesData = await episodesResponse.json();
    const episodes = episodesData.episodes || [];

    if (episodes.length === 0) {
      console.log("[Auto Newsletter] No episodes found");
      return NextResponse.json({
        ok: true,
        message: "No episodes found",
      });
    }

    // Step 2: Get the latest episode
    const latestEpisode = episodes[0];
    console.log(`[Auto Newsletter] Latest episode: ${latestEpisode.title}`);

    // Step 3: Check if we already sent a campaign for this episode (Brevo is our source of truth)
    const episodeKey = `episode-${latestEpisode.youtubeId}`;
    const existingCampaign = await findBrevoCampaignByName(episodeKey);

    if (existingCampaign) {
      console.log(
        `[Auto Newsletter] Campaign already exists (${existingCampaign.status}) for: ${latestEpisode.title}`
      );
      return NextResponse.json({
        ok: true,
        message: "Newsletter already sent for this episode",
        episode: latestEpisode.title,
        campaignId: existingCampaign.id,
        status: existingCampaign.status,
      });
    }

    // Step 4: Fetch transcript
    console.log("[Auto Newsletter] Fetching transcript...");
    let transcript = "";

    try {
      const transcriptResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/newsletter/transcript?videoId=${encodeURIComponent(latestEpisode.youtubeId)}`,
        { cache: "no-store" }
      );

      if (transcriptResponse.ok) {
        const transcriptData = await transcriptResponse.json();
        transcript = transcriptData.transcript || "";
      }
    } catch (err) {
      console.error("[Auto Newsletter] Failed to fetch transcript:", err);
    }

    // Step 5: Generate teaser with OpenAI
    console.log("[Auto Newsletter] Generating teaser...");
    const teaser = await generateTeaser(
      latestEpisode.title,
      transcript,
      latestEpisode.summary
    );

    // Step 6: Send newsletter to all Brevo subscribers
    console.log("[Auto Newsletter] Sending newsletter...");
    const sent = await sendNewsletterToSubscribers(
      latestEpisode.title,
      teaser,
      latestEpisode.youtubeId,
      latestEpisode.thumbnailUrl
    );

    if (!sent) {
      return NextResponse.json(
        { ok: false, error: "Failed to send newsletter" },
        { status: 500 }
      );
    }

    console.log("[Auto Newsletter] ✅ Newsletter sent successfully!");

    return NextResponse.json({
      ok: true,
      message: "Newsletter sent successfully",
      episode: latestEpisode.title,
      videoId: latestEpisode.youtubeId,
    });
  } catch (error) {
    console.error("[Auto Newsletter] Error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function generateTeaser(
  title: string,
  transcript: string,
  existingSummary?: string
): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.warn("[Auto Newsletter] OpenAI API key not configured, using fallback");
    return existingSummary || `Découvrez notre dernier épisode : ${title}`;
  }

  try {
    const https = require("https");

    const prompt = `Tu es un expert en marketing de podcast. Voici le titre et la transcription d'un épisode de podcast :

Titre : ${title}

${transcript ? `Transcription (extrait) :\n${transcript.substring(0, 2000)}` : ""}

${existingSummary ? `Résumé existant :\n${existingSummary}` : ""}

Génère un teaser court et attractif (maximum 200 mots) qui :
1. Capte l'attention dès les premières lignes
2. Donne envie d'écouter l'épisode
3. Révèle les points forts sans tout spoiler
4. Utilise un ton dynamique et engageant
5. Termine par un appel à l'action subtil

Ton : conversationnel, authentique, comme si tu parlais à un ami.
Format : 2-3 paragraphes courts.`;

    const payload = JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.8,
    });

    const response: any = await new Promise((resolve, reject) => {
      const options = {
        hostname: "api.openai.com",
        port: 443,
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Length": Buffer.byteLength(payload),
        },
        rejectUnauthorized: process.env.NODE_ENV === "production",
      };

      const req = https.request(options, (res: any) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`OpenAI API error: ${res.statusCode}`));
          }
        });
      });

      req.on("error", reject);
      req.write(payload);
      req.end();
    });

    const teaser = response.choices?.[0]?.message?.content || "";
    return teaser.trim();
  } catch (error) {
    console.error("[Auto Newsletter] Error generating teaser:", error);
    return existingSummary || `Découvrez notre dernier épisode : ${title}`;
  }
}

async function sendNewsletterToSubscribers(
  title: string,
  teaser: string,
  videoId: string,
  thumbnailUrl: string
): Promise<boolean> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = process.env.BREVO_LIST_ID;
  const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
  const SENDER_NAME = process.env.BREVO_SENDER_NAME || "Le Débrief Podcast";

  if (!BREVO_API_KEY || !BREVO_LIST_ID || !SENDER_EMAIL) {
    console.error("[Auto Newsletter] Brevo not configured");
    return false;
  }

  try {
    const emailHtml = generateNewsletterTemplate(title, teaser, videoId, thumbnailUrl);
    const episodeKey = `episode-${videoId}`;

    // 1) Create email campaign (marketing) targeting the list
    const campaignId = await createBrevoEmailCampaign({
      name: episodeKey,
      subject: `🎙️ Nouvel épisode : ${title}`,
      sender: {
        name: SENDER_NAME,
        email: SENDER_EMAIL,
      },
      htmlContent: emailHtml,
      recipients: {
        listIds: [parseInt(BREVO_LIST_ID)],
      },
    });

    if (!campaignId) {
      console.error("[Auto Newsletter] Failed to create campaign");
      return false;
    }

    // 2) Send now
    const sentNow = await sendBrevoCampaignNow(campaignId);
    if (!sentNow) return false;

    console.log(`[Auto Newsletter] ✅ Campaign sent: ${campaignId}`);
    return true;
  } catch (error) {
    console.error("[Auto Newsletter] Error sending newsletter:", error);
    return false;
  }
}

type BrevoCampaign = { id: number; name: string; status?: string };

async function findBrevoCampaignByName(name: string): Promise<BrevoCampaign | null> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) return null;

  try {
    // Scan the last campaigns; this is our durable “already sent” tracking.
    const result = await brevoRequest("GET", "/v3/emailCampaigns?limit=50&offset=0", BREVO_API_KEY);
    if (!result.ok) return null;

    const campaigns: any[] = result.json?.campaigns || [];
    const match = campaigns.find((c) => c?.name === name);
    if (!match) return null;

    return { id: match.id, name: match.name, status: match.status };
  } catch (e) {
    console.error("[Auto Newsletter] Failed to check existing campaigns:", e);
    return null;
  }
}

async function createBrevoEmailCampaign(payload: any): Promise<number | null> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) return null;

  const result = await brevoRequest("POST", "/v3/emailCampaigns", BREVO_API_KEY, payload);
  if (!result.ok) {
    console.error("[Auto Newsletter] Campaign create failed:", result.statusCode, result.text);
    return null;
  }

  const id = result.json?.id;
  return typeof id === "number" ? id : null;
}

async function sendBrevoCampaignNow(campaignId: number): Promise<boolean> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) return false;

  const result = await brevoRequest("POST", `/v3/emailCampaigns/${campaignId}/sendNow`, BREVO_API_KEY);
  if (!result.ok) {
    console.error("[Auto Newsletter] sendNow failed:", result.statusCode, result.text);
    return false;
  }
  return true;
}

async function brevoRequest(
  method: "GET" | "POST",
  path: string,
  apiKey: string,
  body?: any
): Promise<{ ok: boolean; statusCode: number; text: string; json?: any }> {
  const https = require("https");

  const payload = body ? JSON.stringify(body) : "";
  const headers: Record<string, string | number> = {
    "api-key": apiKey,
    Accept: "application/json",
  };

  if (method === "POST") {
    headers["Content-Type"] = "application/json";
    headers["Content-Length"] = Buffer.byteLength(payload);
  }

  const response: any = await new Promise((resolve, reject) => {
    const options = {
      hostname: "api.brevo.com",
      port: 443,
      path,
      method,
      headers,
      // Fix SSL certificate issue in local development
      rejectUnauthorized: process.env.NODE_ENV === "production",
    };

    const req = https.request(options, (res: any) => {
      let data = "";
      res.on("data", (chunk: Buffer) => (data += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on("error", reject);
    if (method === "POST") req.write(payload);
    req.end();
  });

  const statusCode = response.statusCode || 0;
  const text = response.body || "";
  let json: any = undefined;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    // ignore
  }

  return { ok: statusCode >= 200 && statusCode < 300, statusCode, text, json };
}

function generateNewsletterTemplate(
  title: string,
  teaser: string,
  videoId: string,
  thumbnailUrl: string
): string {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const spotifyUrl = "https://open.spotify.com/show/2MA341D762SdA7azTQYdxw";
  const deezerUrl = "https://www.deezer.com/fr/show/1001898661";

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%); border-radius: 16px; border: 1px solid rgba(0, 224, 209, 0.2);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center;">
              <h1 style="margin: 0 0 8px; background: linear-gradient(to right, #00e0d1, #0c79c5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 36px; font-weight: 700;">le débrief</h1>
              <div style="width: 60px; height: 3px; background: linear-gradient(to right, #00e0d1, #0c79c5); margin: 0 auto;"></div>
            </td>
          </tr>

          <!-- Badge "Nouvel épisode" -->
          <tr>
            <td style="padding: 0 40px; text-align: center;">
              <div style="display: inline-block; padding: 8px 24px; background: rgba(0, 224, 209, 0.1); border: 1px solid rgba(0, 224, 209, 0.3); border-radius: 24px; margin-bottom: 24px;">
                <span style="color: #00e0d1; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">🎙️ Nouvel Épisode</span>
              </div>
            </td>
          </tr>

          <!-- Thumbnail -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <a href="${youtubeUrl}" style="display: block; text-decoration: none;">
                <img src="${thumbnailUrl}" alt="${title}" style="width: 100%; max-width: 520px; border-radius: 12px; display: block; margin: 0 auto; border: 1px solid rgba(0, 224, 209, 0.2);" />
              </a>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 0 40px 24px; text-align: center;">
              <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; line-height: 1.3;">
                ${title}
              </h2>
            </td>
          </tr>

          <!-- Teaser -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 24px;">
                <p style="margin: 0; color: rgba(255, 255, 255, 0.85); font-size: 16px; line-height: 1.7; white-space: pre-line;">
${teaser}
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Buttons -->
          <tr>
            <td style="padding: 0 40px 48px; text-align: center;">
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 8px;">
                    <a href="${youtubeUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #00e0d1 0%, #0c79c5 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                      ▶️ Regarder sur YouTube
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px;">
                    <a href="${spotifyUrl}" style="display: inline-block; padding: 16px 32px; background: rgba(29, 185, 84, 0.1); border: 1px solid #1DB954; color: #1DB954; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                      🎧 Écouter sur Spotify
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Social Links -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <p style="margin: 0 0 16px; color: rgba(255, 255, 255, 0.5); font-size: 14px;">Retrouvez-nous aussi sur :</p>
              <div>
                <a href="https://www.youtube.com/@ledebrief_podcast" style="margin: 0 8px; color: #FF0000; text-decoration: none; font-size: 14px; font-weight: 500;">YouTube</a>
                <span style="color: rgba(255, 255, 255, 0.3);">•</span>
                <a href="${spotifyUrl}" style="margin: 0 8px; color: #1DB954; text-decoration: none; font-size: 14px; font-weight: 500;">Spotify</a>
                <span style="color: rgba(255, 255, 255, 0.3);">•</span>
                <a href="${deezerUrl}" style="margin: 0 8px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500;">Deezer</a>
                <span style="color: rgba(255, 255, 255, 0.3);">•</span>
                <a href="https://www.instagram.com/ledebrief_podcast/" style="margin: 0 8px; color: #E4405F; text-decoration: none; font-size: 14px; font-weight: 500;">Instagram</a>
                <span style="color: rgba(255, 255, 255, 0.3);">•</span>
                <a href="https://www.tiktok.com/@ledebrief_podcast" style="margin: 0 8px; color: #00f2ea; text-decoration: none; font-size: 14px; font-weight: 500;">TikTok</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 12px; text-align: center; line-height: 1.6;">
                Vous recevez cet email car vous êtes abonné à la newsletter Le Débrief Podcast.
                <br />
                <a href="{unsubscribe}" style="color: rgba(255, 255, 255, 0.5); text-decoration: underline;">Se désabonner</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// GET endpoint for manual testing
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Auto Newsletter API is ready. Use POST with Authorization header to trigger.",
    endpoint: "/api/newsletter/auto-send",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_CRON_SECRET",
    },
  });
}
