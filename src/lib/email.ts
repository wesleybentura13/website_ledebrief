import fs from "fs";
import path from "path";

interface Subscriber {
  email: string;
  firstName?: string;
  subscribedAt: string;
}

interface EpisodeContent {
  episodeNumber: number;
  youtubeId: string;
  title: string;
  date: string;
  summary: string;
  transcript: string;
  createdAt: string;
}

/**
 * Sends newsletter email to all subscribers when a new episode is published
 */
export async function sendNewsletterEmail(episode: EpisodeContent): Promise<{ sent: number; failed: number }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.warn("[email] RESEND_API_KEY not configured, skipping email sending");
    return { sent: 0, failed: 0 };
  }

  // Load subscribers
  const subscribersPath = path.join(process.cwd(), "data", "newsletter-subscribers.json");
  let subscribers: Subscriber[] = [];

  if (fs.existsSync(subscribersPath)) {
    const fileContent = fs.readFileSync(subscribersPath, "utf-8");
    subscribers = JSON.parse(fileContent);
  }

  if (subscribers.length === 0) {
    console.log("[email] No subscribers found, skipping email sending");
    return { sent: 0, failed: 0 };
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${episode.youtubeId}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const fromName = process.env.RESEND_FROM_NAME || "Le Débrief Podcast";

  let sent = 0;
  let failed = 0;

  // Send email to each subscriber
  for (const subscriber of subscribers) {
    try {
      const name = subscriber.firstName || "Cher abonné";
      const emailHtml = generateEmailTemplate(name, episode, youtubeUrl);

      console.log(`[email] Sending to ${subscriber.email} from ${fromEmail}...`);

      // Use https module directly to avoid fetch SSL issues
      const https = require("https");
      const emailPayload = JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: subscriber.email,
        subject: `🎙️ Nouvel épisode : ${episode.title}`,
        html: emailHtml,
      });

      const response: any = await new Promise((resolve, reject) => {
        const options = {
          hostname: "api.resend.com",
          port: 443,
          path: "/emails",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Length": Buffer.byteLength(emailPayload),
          },
          rejectUnauthorized: false, // Allow self-signed certificates
        };

        const req = https.request(options, (res: any) => {
          let data = "";
          res.on("data", (chunk: Buffer) => {
            data += chunk.toString();
          });
          res.on("end", () => {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage,
              json: async () => {
                try {
                  return JSON.parse(data);
                } catch {
                  return { raw: data };
                }
              },
              text: async () => data,
            });
          });
        });

        req.on("error", reject);
        req.write(emailPayload);
        req.end();
      });

      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText };
      }

      if (!response.ok) {
        const errorMsg = `Status ${response.status}: ${JSON.stringify(responseData)}`;
        console.error(`[email] ❌ Failed to send to ${subscriber.email}:`, errorMsg);
        throw new Error(errorMsg);
      } else {
        console.log(`[email] ✅ Sent successfully to ${subscriber.email}:`, responseData);
        sent++;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[email] Exception sending to ${subscriber.email}:`, errorMsg);
      failed++;
      throw error; // Re-throw to be caught by caller
    }
  }

  return { sent, failed };
}

/**
 * Generates HTML email template for newsletter
 */
function generateEmailTemplate(name: string, episode: EpisodeContent, youtubeUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvel épisode - Le Débrief</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 2px solid #f0f0f0;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">Le Débrief</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello ${name},
              </p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Voici notre nouvel épisode de cette semaine, la transcription et le lien YouTube ci-dessous.
              </p>
              
              <!-- Episode Title -->
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                ${episode.title}
              </h2>
              
              <!-- Summary -->
              <div style="margin: 0 0 30px; padding: 20px; background-color: #f9f9f9; border-radius: 6px; border-left: 4px solid #0070f3;">
                <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
${episode.summary}
                </p>
              </div>
              
              <!-- YouTube Link -->
              <div style="margin: 0 0 30px; text-align: center;">
                <a href="${youtubeUrl}" 
                   style="display: inline-block; padding: 14px 28px; background-color: #FF0000; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  📺 Regarder sur YouTube
                </a>
              </div>
              
              <!-- Transcript -->
              <div style="margin: 0 0 30px;">
                <h3 style="margin: 0 0 15px; color: #1a1a1a; font-size: 20px; font-weight: 600;">
                  Transcription
                </h3>
                <div style="padding: 20px; background-color: #fafafa; border-radius: 6px; border: 1px solid #e0e0e0;">
                  <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.7; white-space: pre-wrap; max-height: 400px; overflow-y: auto;">
${episode.transcript.substring(0, 2000)}${episode.transcript.length > 2000 ? '...' : ''}
                  </p>
                </div>
                ${episode.transcript.length > 2000 ? `
                <p style="margin: 15px 0 0; color: #888888; font-size: 13px; text-align: center;">
                  <a href="${youtubeUrl}" style="color: #0070f3; text-decoration: none;">Voir la transcription complète sur YouTube →</a>
                </p>
                ` : ''}
              </div>
              
              <!-- Footer -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0; text-align: center;">
                <p style="margin: 0 0 10px; color: #888888; font-size: 14px;">
                  Le débrief
                </p>
                <p style="margin: 0; color: #aaaaaa; font-size: 12px;">
                  Vous recevez cet email car vous êtes abonné à notre newsletter.
                </p>
              </div>
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

