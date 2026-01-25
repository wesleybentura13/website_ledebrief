// Netlify Function triggered on form submission
// Sends welcome email to subscriber and notification to admin

const https = require("https");

exports.handler = async (event) => {
  // Only process form submissions
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Check if this is a newsletter form submission
    if (data.payload && data.payload.data) {
      const { email, firstName } = data.payload.data;
      
      if (!email) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Email is required" }),
        };
      }

      console.log(`[Newsletter] New subscriber: ${email}${firstName ? ` (${firstName})` : ''}`);

      // Send welcome email and admin notification
      await Promise.allSettled([
        sendWelcomeEmail(email, firstName),
        sendAdminNotification(email, firstName),
      ]);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Emails sent successfully" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Form processed" }),
    };
  } catch (error) {
    console.error("[Newsletter] Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

async function sendWelcomeEmail(email, firstName) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured");
    return;
  }

  const name = firstName || "Cher abonné";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const fromName = process.env.RESEND_FROM_NAME || "Le Débrief Podcast";

  const emailHtml = generateWelcomeTemplate(name);

  try {
    const response = await sendEmailViaResend({
      apiKey: RESEND_API_KEY,
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: "🎉 Bienvenue dans la communauté Le Débrief !",
      html: emailHtml,
    });

    console.log(`[Email] ✅ Welcome email sent to ${email}`);
    return response;
  } catch (error) {
    console.error(`[Email] ❌ Failed to send welcome email to ${email}:`, error.message);
    throw error;
  }
}

async function sendAdminNotification(email, firstName) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!RESEND_API_KEY || !adminEmail) {
    console.warn("[Email] Admin notification skipped (missing config)");
    return;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const fromName = process.env.RESEND_FROM_NAME || "Le Débrief Podcast";
  const name = firstName || "Sans prénom";

  const emailHtml = `
    <!DOCTYPE html>
    <html><body style="font-family: sans-serif; padding: 20px;">
      <h2>🔔 Nouvel inscrit à la newsletter</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Prénom :</strong> ${name}</p>
        <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
      </div>
    </body></html>
  `;

  try {
    const response = await sendEmailViaResend({
      apiKey: RESEND_API_KEY,
      from: `${fromName} <${fromEmail}>`,
      to: adminEmail,
      subject: "🔔 Nouvel inscrit à la newsletter !",
      html: emailHtml,
    });

    console.log(`[Email] ✅ Admin notification sent`);
    return response;
  } catch (error) {
    console.error(`[Email] ❌ Failed to send admin notification:`, error.message);
    throw error;
  }
}

function sendEmailViaResend({ apiKey, from, to, subject, html }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ from, to, subject, html });

    const options = {
      hostname: "api.resend.com",
      port: 443,
      path: "/emails",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function generateWelcomeTemplate(name) {
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
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center;">
              <h1 style="margin: 0 0 16px; background: linear-gradient(to right, #00e0d1, #0c79c5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 36px; font-weight: 700;">
                le débrief
              </h1>
              <div style="width: 60px; height: 3px; background: linear-gradient(to right, #00e0d1, #0c79c5); margin: 0 auto; border-radius: 2px;"></div>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 48px;">
              <div style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border-radius: 12px; padding: 32px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <p style="margin: 0 0 24px; color: #ffffff; font-size: 20px; font-weight: 600;">
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
                
                <div style="text-align: center; margin: 32px 0 0;">
                  <a href="https://www.youtube.com/@ledebrief_podcast" 
                     style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #00e0d1 0%, #0c79c5 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                    🎙️ Découvrir nos épisodes
                  </a>
                </div>
              </div>
              
              <div style="margin-top: 32px; text-align: center;">
                <p style="margin: 0 0 16px; color: rgba(255, 255, 255, 0.5); font-size: 14px;">
                  Retrouve-nous aussi sur :
                </p>
                <div>
                  <a href="https://www.youtube.com/@ledebrief_podcast" style="margin: 0 8px; color: #FF0000; text-decoration: none;">YouTube</a>
                  <span style="color: rgba(255, 255, 255, 0.3);">•</span>
                  <a href="https://open.spotify.com/show/2MA341D762SdA7azTQYdxw" style="margin: 0 8px; color: #1DB954; text-decoration: none;">Spotify</a>
                  <span style="color: rgba(255, 255, 255, 0.3);">•</span>
                  <a href="https://www.instagram.com/ledebrief_podcast/" style="margin: 0 8px; color: #E4405F; text-decoration: none;">Instagram</a>
                </div>
              </div>
              
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
