import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Subscriber {
  email: string;
  firstName?: string;
  subscribedAt: string;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let email = "";
    let firstName = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = body.email?.toString().trim() ?? "";
      firstName = body.firstName?.toString().trim() ?? "";
    } else {
      const form = await request.formData();
      email = (form.get("email") as string | null)?.trim() ?? "";
      firstName = (form.get("firstName") as string | null)?.trim() ?? "";
    }

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Email manquant" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, message: "Format d'email invalide" },
        { status: 400 },
      );
    }

    // Save subscriber to file
    const subscribersPath = path.join(process.cwd(), "data", "newsletter-subscribers.json");
    let subscribers: Subscriber[] = [];

    if (fs.existsSync(subscribersPath)) {
      const fileContent = fs.readFileSync(subscribersPath, "utf-8");
      subscribers = JSON.parse(fileContent);
    }

    // Check if already subscribed
    const existingSubscriber = subscribers.find((sub) => sub.email.toLowerCase() === email.toLowerCase());
    if (existingSubscriber) {
      return NextResponse.json(
        { ok: true, message: "Vous êtes déjà inscrit à la newsletter !" },
        { status: 200 },
      );
    }

    // Add new subscriber
    subscribers.push({
      email: email.toLowerCase(),
      firstName: firstName || undefined,
      subscribedAt: new Date().toISOString(),
    });

    fs.writeFileSync(subscribersPath, JSON.stringify(subscribers, null, 2));

    console.info("[newsletter] new subscriber", { email, firstName });

    return NextResponse.json(
      { ok: true, message: "Inscription réussie ! Merci de vous être abonné." },
      { status: 200 },
    );
  } catch (error) {
    console.error("[newsletter] error", error);
    return NextResponse.json(
      { ok: false, message: "Impossible de traiter l'inscription" },
      { status: 500 },
    );
  }
}


