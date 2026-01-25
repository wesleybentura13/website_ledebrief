import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, firstName } = await request.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Email requis" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, message: "Format d'email invalide" },
        { status: 400 }
      );
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const BREVO_LIST_ID = process.env.BREVO_LIST_ID;

    if (!BREVO_API_KEY) {
      console.error("[Brevo] API key not configured");
      return NextResponse.json(
        { ok: false, message: "Configuration manquante" },
        { status: 500 }
      );
    }

    if (!BREVO_LIST_ID) {
      console.error("[Brevo] List ID not configured");
      return NextResponse.json(
        { ok: false, message: "Configuration manquante" },
        { status: 500 }
      );
    }

    // Add contact to Brevo
    const addContactResult = await addContactToBrevo(
      email,
      firstName,
      BREVO_API_KEY,
      parseInt(BREVO_LIST_ID)
    );

    if (!addContactResult.success) {
      // Check if it's a "contact already exists" error
      if (addContactResult.alreadyExists) {
        return NextResponse.json({
          ok: true,
          message: "Vous êtes déjà inscrit à la newsletter !",
        });
      }

      return NextResponse.json(
        { ok: false, message: addContactResult.error || "Erreur lors de l'inscription" },
        { status: 500 }
      );
    }

    console.log(`[Brevo] ✅ Contact added: ${email}${firstName ? ` (${firstName})` : ''}`);

    // Send welcome email and admin notification (don't wait)
    Promise.allSettled([
      sendWelcomeEmail(email, firstName),
      sendAdminNotification(email, firstName),
    ]).catch(err => console.error("[Brevo] Email error:", err));

    return NextResponse.json({
      ok: true,
      message: "Ton inscription est bien prise en compte ! Merci et à très vite dans ta boîte mail 📬",
    });
  } catch (error) {
    console.error("[Brevo] Error:", error);
    return NextResponse.json(
      { ok: false, message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

async function addContactToBrevo(
  email: string,
  firstName: string | undefined,
  apiKey: string,
  listId: number
): Promise<{ success: boolean; alreadyExists?: boolean; error?: string }> {
  try {
    const https = require("https");

    const contactData = {
      email: email.toLowerCase(),
      attributes: {
        PRENOM: firstName || "",
        LISTE: "Newsletter Le Débrief",
      },
      listIds: [listId],
      updateEnabled: true, // Update contact if already exists
    };

    const payload = JSON.stringify(contactData);

    const response: any = await new Promise((resolve, reject) => {
      const options = {
        hostname: "api.brevo.com",
        port: 443,
        path: "/v3/contacts",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
          "Content-Length": Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res: any) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            body: data,
          });
        });
      });

      req.on("error", reject);
      req.write(payload);
      req.end();
    });

    if (response.statusCode === 201 || response.statusCode === 204) {
      return { success: true };
    }

    // Contact already exists (code 400 with specific message)
    if (response.statusCode === 400) {
      try {
        const errorData = JSON.parse(response.body);
        if (errorData.code === "duplicate_parameter") {
          console.log(`[Brevo] Contact already exists: ${email}`);
          return { success: true, alreadyExists: true };
        }
      } catch (e) {
        // Ignore JSON parse error
      }
    }

    console.error("[Brevo] Add contact error:", response.statusCode, response.body);
    return {
      success: false,
      error: `Erreur Brevo (${response.statusCode})`,
    };
  } catch (error) {
    console.error("[Brevo] Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

async function sendWelcomeEmail(email: string, firstName?: string) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.ADMIN_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Le Débrief Podcast";

  if (!BREVO_API_KEY || !senderEmail) {
    console.warn("[Brevo] Welcome email skipped (missing config)");
    return;
  }

  const name = firstName || "Cher abonné";

  try {
    const https = require("https");

    const emailData = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email, name: firstName || "" }],
      subject: "🎉 Bienvenue dans la communauté Le Débrief !",
      htmlContent: generateWelcomeTemplate(name),
    };

    const payload = JSON.stringify(emailData);

    const response: any = await new Promise((resolve, reject) => {
      const options = {
        hostname: "api.brevo.com",
        port: 443,
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
          "Content-Length": Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res: any) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[Brevo] ✅ Welcome email sent to ${email}`);
            resolve(data);
          } else {
            console.error(`[Brevo] ❌ Welcome email failed: ${res.statusCode}`);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      });

      req.on("error", reject);
      req.write(payload);
      req.end();
    });
  } catch (error) {
    console.error("[Brevo] Welcome email error:", error);
  }
}

async function sendAdminNotification(email: string, firstName?: string) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || adminEmail;
  const senderName = process.env.BREVO_SENDER_NAME || "Le Débrief Podcast";

  if (!BREVO_API_KEY || !adminEmail || !senderEmail) {
    console.warn("[Brevo] Admin notification skipped (missing config)");
    return;
  }

  const name = firstName || "Sans prénom";

  try {
    const https = require("https");

    const emailData = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email: adminEmail }],
      subject: "🔔 Nouvel inscrit à la newsletter !",
      htmlContent: `
        <!DOCTYPE html>
        <html><body style="font-family: sans-serif; padding: 20px;">
          <h2>🔔 Nouvel inscrit à la newsletter</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Prénom :</strong> ${name}</p>
            <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
          <p style="color: #666; font-size: 14px;">
            Le contact a été ajouté à votre liste Brevo "Newsletter Le Débrief"
          </p>
        </body></html>
      `,
    };

    const payload = JSON.stringify(emailData);

    await new Promise((resolve, reject) => {
      const options = {
        hostname: "api.brevo.com",
        port: 443,
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
          "Content-Length": Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res: any) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[Brevo] ✅ Admin notification sent`);
            resolve(data);
          } else {
            console.error(`[Brevo] ❌ Admin notification failed: ${res.statusCode}`);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      });

      req.on("error", reject);
      req.write(payload);
      req.end();
    });
  } catch (error) {
    console.error("[Brevo] Admin notification error:", error);
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
              <div style="width: 60px; height: 3px; background: linear-gradient(to right, #00e0d1, #0c79c5); margin: 0 auto;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 48px;">
              <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 32px;">
                <p style="margin: 0 0 24px; color: #ffffff; font-size: 20px; font-weight: 600;">🎉 Bienvenue ${name} !</p>
                <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.85); font-size: 16px; line-height: 1.7;">
                  Ton inscription est bien prise en compte ! Tu fais maintenant partie de la communauté <strong style="color: #00e0d1;">Le Débrief</strong>.
                </p>
                <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.85); font-size: 16px; line-height: 1.7;">
                  Chaque semaine, tu recevras un email avec notre dernier épisode, un résumé exclusif et la transcription complète.
                </p>
                <p style="margin: 0 0 32px; color: rgba(255, 255, 255, 0.85); font-size: 16px;">
                  À très vite dans ta boîte mail ! 📬
                </p>
                <div style="text-align: center;">
                  <a href="https://www.youtube.com/@ledebrief_podcast" 
                     style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #00e0d1 0%, #0c79c5 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                    🎙️ Découvrir nos épisodes
                  </a>
                </div>
              </div>
              <div style="margin-top: 32px; text-align: center;">
                <p style="margin: 0 0 16px; color: rgba(255, 255, 255, 0.5); font-size: 14px;">Retrouve-nous aussi sur :</p>
                <div>
                  <a href="https://www.youtube.com/@ledebrief_podcast" style="margin: 0 8px; color: #FF0000; text-decoration: none;">YouTube</a>
                  <span style="color: rgba(255, 255, 255, 0.3);">•</span>
                  <a href="https://open.spotify.com/show/2MA341D762SdA7azTQYdxw" style="margin: 0 8px; color: #1DB954; text-decoration: none;">Spotify</a>
                  <span style="color: rgba(255, 255, 255, 0.3);">•</span>
                  <a href="https://www.instagram.com/ledebrief_podcast/" style="margin: 0 8px; color: #E4405F; text-decoration: none;">Instagram</a>
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
