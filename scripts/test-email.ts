import fs from "fs";
import path from "path";
import { config } from "dotenv";

// Load environment variables
config({ path: path.join(process.cwd(), ".env.local") });

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

async function testEmail() {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.error("❌ RESEND_API_KEY not found in .env.local");
    process.exit(1);
  }

  console.log("✅ Resend API Key found:", resendApiKey.substring(0, 10) + "...");

  // Load episode #35
  const contentPath = path.join(process.cwd(), "data", "newsletter-content.json");
  const fileContent = fs.readFileSync(contentPath, "utf-8");
  const newsletterContent: EpisodeContent[] = JSON.parse(fileContent);
  const episode = newsletterContent.find((e) => e.episodeNumber === 35);

  if (!episode) {
    console.error("❌ Episode #35 not found");
    process.exit(1);
  }

  // Load subscribers
  const subscribersPath = path.join(process.cwd(), "data", "newsletter-subscribers.json");
  const subscribersContent = fs.readFileSync(subscribersPath, "utf-8");
  const subscribers: Subscriber[] = JSON.parse(subscribersContent);

  if (subscribers.length === 0) {
    console.error("❌ No subscribers found");
    process.exit(1);
  }

  console.log(`📧 Sending to ${subscribers.length} subscriber(s)...`);

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const fromName = process.env.RESEND_FROM_NAME || "Le Débrief Podcast";
  const youtubeUrl = `https://www.youtube.com/watch?v=${episode.youtubeId}`;

  // Simple email template
  const emailHtml = `
    <h1>Le Débrief</h1>
    <p>Hello ${subscribers[0].firstName || "Cher abonné"},</p>
    <p>Voici notre nouvel épisode de cette semaine, la transcription et le lien YouTube ci-dessous.</p>
    <h2>${episode.title}</h2>
    <p>${episode.summary}</p>
    <p><a href="${youtubeUrl}">📺 Regarder sur YouTube</a></p>
    <h3>Transcription</h3>
    <p>${episode.transcript.substring(0, 500)}...</p>
    <p>Le débrief</p>
  `;

  try {
    console.log(`\n📤 Sending email to ${subscribers[0].email}...`);
    console.log(`   From: ${fromName} <${fromEmail}>`);
    console.log(`   Subject: 🎙️ Nouvel épisode : ${episode.title}`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: subscribers[0].email,
        subject: `🎙️ Nouvel épisode : ${episode.title}`,
        html: emailHtml,
      }),
    });

    const responseText = await response.text();
    console.log(`\n📬 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error("❌ Error response:", responseText);
      process.exit(1);
    }

    const result = JSON.parse(responseText);
    console.log("✅ Email sent successfully!");
    console.log("   Email ID:", result.id);
    console.log(`\n📧 Check ${subscribers[0].email} for the newsletter!`);
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testEmail();

