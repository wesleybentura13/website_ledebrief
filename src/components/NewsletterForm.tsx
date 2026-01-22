"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, firstName }),
      });

      const data = await response.json();

      if (data.ok) {
        setStatus("success");
        setMessage(data.message || "Inscription réussie ! Merci de vous être abonné.");
        setEmail("");
        setFirstName("");
        // Mark as subscriber in localStorage
        localStorage.setItem("newsletter_subscriber", "true");
      } else {
        setStatus("error");
        setMessage(data.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Impossible de traiter l'inscription. Veuillez réessayer.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-white/80">
            Prénom (optionnel)
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 backdrop-blur-sm transition-all focus:border-[#00e0d1] focus:outline-none focus:ring-2 focus:ring-[#00e0d1]/30"
            placeholder="Votre prénom"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
            Email <span className="text-[#00e0d1]">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 backdrop-blur-sm transition-all focus:border-[#00e0d1] focus:outline-none focus:ring-2 focus:ring-[#00e0d1]/30"
            placeholder="votre@email.com"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-gradient-to-r from-[#00e0d1] to-[#0c79c5] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,224,209,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? "Inscription..." : "S'abonner à la newsletter"}
        </button>
      </div>
      {message && (
        <div
          className={`mt-6 rounded-xl px-4 py-3 text-sm text-center backdrop-blur-sm ${
            status === "success"
              ? "bg-[#00e0d1]/20 text-[#00e0d1] border border-[#00e0d1]/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
}

