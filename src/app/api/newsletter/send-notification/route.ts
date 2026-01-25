import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, firstName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Email required" },
        { status: 400 }
      );
    }

    console.log(`[Newsletter] New subscriber: ${email}${firstName ? ` (${firstName})` : ''}`);

    // Send emails asynchronously (don't wait)
    Promise.allSettled([
      sendWelcomeEmail(email, firstName),
      sendAdminNotification(email, firstName),
    ]).catch(err => console.error("[Newsletter] Email error:", err));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Newsletter] Error:", error);
    return NextResponse.json(
      { ok: false, message: "Error" },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(email: string, firstName?: string) {
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
    const https = require("https");
    const payload = JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: "🎉 Bienvenue dans la communauté Le Débrief !",
      html: emailHtml,
    });

    await new Promise((resolve, reject) => {
      const options = {
        hostname: "api.resend.com",
        port: 443,
        path: "/emails",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Length": Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res: any) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[Email] ✅ Welcome email sent to ${email}`);
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on("error", reject);
      req.write(payload);
      req.end();
    });
  } catch (error) {
    console.error(`[Email] ❌ Failed to send welcome email:`, error);
  }
}

async function sendAdminNotification(email: string, firstName?: string) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!RESEND_API_KEY || !adminEmail) {
    console.warn("[Email] Admin notification skipped");
    return;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const fromName = process.env.RESEND_FROM_NAME || "Le Débrief Podcast";
  const name = firstName || "Sans prénom";

  const emailHtml = `
    <!DOCTYPE html>
    <html><body style="font-family: sans-serif; padding: 20px;">
      <h2>🔔 Nouvel inscrit à la newsletter</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Prénom :</strong> ${name}</p>
        <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
      </div>
    </body></html>
  `;

  try {
    const https = require("https");
    const payload = JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: adminEmail,
      subject: "🔔 Nouvel inscrit à la newsletter !",
      html: emailHtml,
    });

    await new Promise((resolve, reject) => {
      const options = {
        hostname: "api.resend.com",
        port: 443,
        path: "/emails",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Length": Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res: any) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[Email] ✅ Admin notification sent`);
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on("error", reject);
      req.write(payload);
      req.end();
    });
  } catch (error) {
    console.error(`[Email] ❌ Failed to send admin notification:`, error);
  }
}

function generateWelcomeTemplate(name: string) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%); border-radius: 16px; border: 1px solid rgba(0, 224, 209, 0.2);">
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center;">
              <h1 style="margin: 0 0 16px; background: linear-gradient(to right, #00e0d1, #0c79c5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 36px; font-weight: 700;">le débrief</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 48px;">
              <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 32px;">
                <p style="margin: 0 0 24px; color: #ffffff; font-size: 20px; font-weight: 600;">🎉 Bienvenue ${name} !</p>
                <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.85); font-size: 16px; line-height: 1.7;">
                  Ton inscription est bien prise en compte ! Tu fais maintenant partie de la communauté <strong style="color: #00e0d1;">Le Débrief</strong>.
                </p>
                <p style="margin: 0 0 32px; color: rgba(255, 255, 255, 0.85); font-size: 16px;">
                  À très vite dans ta boîte mail ! 📬
                </p>
                <div style="text-align: center;">
                  <a href="https://www.youtube.com/@ledebrief_podcast" 
                     style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #00e0d1 0%, #0c79c5 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600;">
                    🎙️ Découvrir nos épisodes
                  </a>
                </div>
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
