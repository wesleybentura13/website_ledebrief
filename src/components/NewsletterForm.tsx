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
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="mb-4">
        <label htmlFor="firstName" className="mb-2 block text-sm font-semibold text-foreground">
          Prénom (optionnel)
        </label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          placeholder="Votre prénom"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-foreground">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          placeholder="votre@email.com"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-brand px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Inscription..." : "S'abonner à la newsletter"}
      </button>
      {message && (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            status === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
}

