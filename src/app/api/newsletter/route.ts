import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendWelcomeEmail, notifyAdminNewSubscriber } from "@/lib/email";

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
    const newSubscriber = {
      email: email.toLowerCase(),
      firstName: firstName || undefined,
      subscribedAt: new Date().toISOString(),
    };
    
    subscribers.push(newSubscriber);
    fs.writeFileSync(subscribersPath, JSON.stringify(subscribers, null, 2));

    console.info("[newsletter] new subscriber", { email, firstName });

    // Send welcome email to subscriber (don't await to avoid blocking response)
    sendWelcomeEmail(email, firstName).catch((err) => {
      console.error("[newsletter] Failed to send welcome email:", err);
    });

    // Notify admin of new subscriber (don't await to avoid blocking response)
    notifyAdminNewSubscriber(email, firstName).catch((err) => {
      console.error("[newsletter] Failed to notify admin:", err);
    });

    return NextResponse.json(
      { ok: true, message: "Ton inscription est bien prise en compte ! Merci et à très vite dans ta boîte mail 📬" },
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


