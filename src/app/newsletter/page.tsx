"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NewsletterItem {
  episodeNumber: number;
  youtubeId: string;
  title: string;
  date: string;
  summary: string;
  createdAt: string;
}

export default function NewsletterPage() {
  const [content, setContent] = useState<NewsletterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [lockedCount, setLockedCount] = useState(0);

  useEffect(() => {
    // Check if user is subscriber (for now, we'll check localStorage or cookie)
    // In production, you'd check authentication/session
    const checkSubscriber = localStorage.getItem("newsletter_subscriber") === "true";
    setIsSubscriber(checkSubscriber);

    fetch(`/api/newsletter/content?subscriber=${checkSubscriber}`)
      .then((res) => res.json())
      .then((data) => {
        setContent(data.publicContent || []);
        setLockedCount(data.lockedCount || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch newsletter content:", err);
        setLoading(false);
      });
  }, []);

  const formatDate = (date: string) => {
    try {
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(date));
    } catch {
      return date;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7fb] text-foreground">
      <div className="relative w-full bg-[#0c79c5] shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-8 lg:px-12">
          <Link href="/">
            <Image
              src="/logo-banner.svg"
              alt="Le Debrief Podcast"
              width={320}
              height={80}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold text-white">
            <a className="rounded-full px-3 py-2 hover:text-brand-secondary" href="/episodes">
              Episodes
            </a>
            <a className="rounded-full px-3 py-2 hover:text-brand-secondary" href="/about">
              About
            </a>
            <a className="rounded-full px-3 py-2 hover:text-brand-secondary" href="/newsletter">
              Newsletter
            </a>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-semibold text-foreground">Newsletter</h1>
          <p className="text-lg text-foreground/70">
            Résumés des épisodes du podcast Le Débrief
          </p>
        </div>

        {!isSubscriber && lockedCount > 0 && (
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-brand/10 via-brand-accent/10 to-white p-6 shadow-md ring-1 ring-black/5">
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              🔒 Contenu exclusif pour les abonnés
            </h2>
            <p className="mb-4 text-foreground/70">
              Les {lockedCount} derniers résumés sont réservés aux abonnés de la newsletter.
            </p>
            <a
              href="/#newsletter"
              className="inline-block rounded-full bg-brand px-6 py-3 text-white shadow-md transition hover:bg-brand-secondary"
            >
              S&apos;abonner à la newsletter
            </a>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
              <p className="text-foreground/70">Chargement des résumés...</p>
            </div>
          </div>
        ) : content.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md ring-1 ring-black/5">
            <p className="text-lg text-foreground/70">
              Aucun résumé disponible pour le moment.
            </p>
            <p className="mt-2 text-sm text-foreground/60">
              Les résumés seront disponibles après la génération pour chaque épisode.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {content.map((item) => (
              <article
                key={item.episodeNumber}
                className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-black/5"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="mb-2 text-2xl font-semibold text-foreground">
                      {item.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-brand">
                        Épisode #{item.episodeNumber}
                      </span>
                      <span className="text-foreground/60">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${encodeURIComponent(item.youtubeId)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF0000] shadow-md transition hover:scale-110 hover:shadow-lg"
                    aria-label="Voir sur YouTube"
                  >
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="leading-relaxed text-foreground whitespace-pre-line">
                    {item.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


