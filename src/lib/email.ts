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
 * Sends a welcome email to a new subscriber
 */
export async function sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.warn("[email] RESEND_API_KEY not configured, skipping welcome email");
    return false;
  }

  const name = firstName || "Cher abonné";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const fromName = process.env.RESEND_FROM_NAME || "Le Débrief Podcast";

  try {
    const emailHtml = generateWelcomeEmailTemplate(name);
    
    console.log(`[email] Sending welcome email to ${email}...`);

    const https = require("https");
    const emailPayload = JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: `🎉 Bienvenue dans la communauté Le Débrief !`,
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
        rejectUnauthorized: false,
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
          });
        });
      });

      req.on("error", reject);
      req.write(emailPayload);
      req.end();
    });

    if (response.ok) {
      console.log(`[email] ✅ Welcome email sent to ${email}`);
      return true;
    } else {
      console.error(`[email] ❌ Failed to send welcome email to ${email}`);
      return false;
    }
  } catch (error) {
    console.error(`[email] Exception sending welcome email:`, error);
    return false;
  }
}

/**
 * Notifies admin of a new subscriber
 */
export async function notifyAdminNewSubscriber(email: string, firstName?: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL;
  
  if (!resendApiKey || !adminEmail) {
    console.warn("[email] RESEND_API_KEY or ADMIN_EMAIL not configured, skipping admin notification");
    return false;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const fromName = process.env.RESEND_FROM_NAME || "Le Débrief Podcast";

  try {
    const emailHtml = generateAdminNotificationTemplate(email, firstName);
    
    console.log(`[email] Notifying admin at ${adminEmail}...`);

    const https = require("https");
    const emailPayload = JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: adminEmail,
      subject: `🔔 Nouvel inscrit à la newsletter !`,
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
        rejectUnauthorized: false,
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
          });
        });
      });

      req.on("error", reject);
      req.write(emailPayload);
      req.end();
    });

    if (response.ok) {
      console.log(`[email] ✅ Admin notification sent`);
      return true;
    } else {
      console.error(`[email] ❌ Failed to send admin notification`);
      return false;
    }
  } catch (error) {
    console.error(`[email] Exception sending admin notification:`, error);
    return false;
  }
}

/**
 * Generates HTML email template for welcome message
 */
function generateWelcomeEmailTemplate(name: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue - Le Débrief</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%); border-radius: 16px; border: 1px solid rgba(0, 224, 209, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);">
          <!-- Header -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center;">
              <h1 style="margin: 0 0 16px; background: linear-gradient(to right, #00e0d1, #0c79c5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 36px; font-weight: 700; letter-spacing: -0.5px;">
                le débrief
              </h1>
              <div style="width: 60px; height: 3px; background: linear-gradient(to right, #00e0d1, #0c79c5); margin: 0 auto; border-radius: 2px;"></div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 48px;">
              <div style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border-radius: 12px; padding: 32px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <p style="margin: 0 0 24px; color: #ffffff; font-size: 20px; font-weight: 600; line-height: 1.4;">
                  🎉 Bienvenue ${name} !
                </p>
                
                <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.85); font-size: 16px; line-height: 1.7;">
                  Ton inscription est bien prise en compte ! Tu fais maintenant partie de la communauté <strong style="color: #00e0d1;">Le Débrief</strong>.
                </p>
                
                <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.85); font-size: 16px; line-height: 1.7;">
                  Chaque semaine, tu recevras un email avec notre dernier épisode, un résumé exclusif et la transcription complète. Sport, cinéma, finance, actualité... on décortique tout sans filtre !
                </p>
                
                <p style="margin: 0 0 32px; color: rgba(255, 255, 255, 0.85); font-size: 16px; line-height: 1.7;">
                  À très vite dans ta boîte mail ! 📬
                </p>
                
                <!-- CTA -->
                <div style="text-align: center; margin: 32px 0 0;">
                  <a href="https://www.youtube.com/@ledebrief_podcast" 
                     style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #00e0d1 0%, #0c79c5 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 16px rgba(0, 224, 209, 0.3);">
                    🎙️ Découvrir nos épisodes
                  </a>
                </div>
              </div>
              
              <!-- Social Links -->
              <div style="margin-top: 32px; text-align: center;">
                <p style="margin: 0 0 16px; color: rgba(255, 255, 255, 0.5); font-size: 14px;">
                  Retrouve-nous aussi sur :
                </p>
                <div style="display: inline-block;">
                  <a href="https://www.youtube.com/@ledebrief_podcast" style="display: inline-block; margin: 0 8px; color: #FF0000; text-decoration: none; font-size: 13px;">YouTube</a>
                  <span style="color: rgba(255, 255, 255, 0.3);">•</span>
                  <a href="https://open.spotify.com/show/2MA341D762SdA7azTQYdxw" style="display: inline-block; margin: 0 8px; color: #1DB954; text-decoration: none; font-size: 13px;">Spotify</a>
                  <span style="color: rgba(255, 255, 255, 0.3);">•</span>
                  <a href="https://www.instagram.com/ledebrief_podcast/" style="display: inline-block; margin: 0 8px; color: #E4405F; text-decoration: none; font-size: 13px;">Instagram</a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
                <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 12px;">
                  © ${new Date().getFullYear()} Le Débrief Podcast. Tous droits réservés.
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

/**
 * Generates HTML email template for admin notification
 */
function generateAdminNotificationTemplate(email: string, firstName?: string): string {
  const name = firstName || "Sans prénom";
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvel inscrit</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                🔔 Nouvel inscrit à la newsletter
              </h2>
              
              <div style="padding: 24px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #00e0d1;">
                <p style="margin: 0 0 12px; color: #333333; font-size: 16px;">
                  <strong>Email :</strong> ${email}
                </p>
                <p style="margin: 0; color: #333333; font-size: 16px;">
                  <strong>Prénom :</strong> ${name}
                </p>
              </div>
              
              <p style="margin: 24px 0 0; color: #666666; font-size: 14px;">
                Inscrit le ${new Date().toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
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

