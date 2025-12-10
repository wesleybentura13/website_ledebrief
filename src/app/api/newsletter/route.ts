import { NextResponse } from "next/server";

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

    // Stub: plug your ESP or database here.
    console.info("[newsletter] new subscriber", { email, firstName });

    return NextResponse.redirect(new URL("/?subscribed=1", request.url), {
      status: 303,
    });
  } catch (error) {
    console.error("[newsletter] error", error);
    return NextResponse.json(
      { ok: false, message: "Impossible de traiter l’inscription" },
      { status: 500 },
    );
  }
}

