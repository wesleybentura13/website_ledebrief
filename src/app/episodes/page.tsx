"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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

interface Episode {
  slug: string;
  title: string;
  date: string;
  duration?: string;
  summary?: string;
  tags?: string[];
  transcript?: string;
  youtubeId: string;
  thumbnailUrl: string;
  link?: string;
}

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to fetch YouTube episodes from the channel
    // First try with channel ID from env, then try with handle
    const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;
    const CHANNEL_HANDLE = "ledebrief_podcast";
    
    const fetchEpisodes = async () => {
      try {
        let data;
        
        if (CHANNEL_ID) {
          // Try with channel ID first
          const response = await fetch(`/api/fetch-episodes?channelId=${CHANNEL_ID}`);
          data = await response.json();
        } else {
          // Try with handle
          const response = await fetch(`/api/youtube-channel?handle=${CHANNEL_HANDLE}`);
          data = await response.json();
        }
        
        if (data.episodes && data.episodes.length > 0) {
          setEpisodes(data.episodes);
        } else if (data.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error("Failed to fetch YouTube episodes:", err);
        setError("Impossible de charger les épisodes. Veuillez vérifier la configuration.");
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, []);

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
            <a className="rounded-full px-3 py-2 hover:text-brand-secondary" href="/#about">
              About
            </a>
            <a className="rounded-full px-3 py-2 hover:text-brand-secondary" href="/#newsletter">
              Newsletter
            </a>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-foreground">Tous les épisodes</h1>
          <p className="mt-2 text-lg text-foreground/70">
            Découvrez tous les épisodes du podcast Le Débrief
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
              <p className="text-foreground/70">Chargement des épisodes...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-yellow-50 p-8 shadow-md ring-1 ring-yellow-200">
            <p className="mb-4 text-lg font-semibold text-yellow-800">⚠️ {error}</p>
            <div className="space-y-3 text-left text-sm text-yellow-700">
              <p className="font-semibold">Pour afficher vos épisodes YouTube :</p>
              <ol className="ml-4 list-decimal space-y-2">
                <li>Allez sur <a href="https://www.youtube.com/@ledebrief_podcast" target="_blank" rel="noopener noreferrer" className="text-brand underline">votre chaîne YouTube</a></li>
                <li>Faites un clic droit → "Afficher le code source" (ou Cmd+Option+U sur Mac)</li>
                <li>Appuyez sur Cmd+F (Mac) ou Ctrl+F (Windows) pour rechercher</li>
                <li>Cherchez <code className="rounded bg-yellow-100 px-1.5 py-0.5">"channelId"</code></li>
                <li>Copiez l'ID (il ressemble à <code className="rounded bg-yellow-100 px-1.5 py-0.5">UCxxxxxxxxxxxxxxxxxxxxx</code>)</li>
                <li>Créez un fichier <code className="rounded bg-yellow-100 px-1.5 py-0.5">.env.local</code> à la racine du projet</li>
                <li>Ajoutez : <code className="block rounded bg-yellow-100 px-2 py-1 mt-2">NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=VOTRE_CHANNEL_ID</code></li>
                <li>Redémarrez le serveur de développement</li>
              </ol>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {episodes.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {episodes.map((episode) => (
                  <article
                    key={episode.slug}
                    className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-lg hover:ring-black/10"
                  >
                    <Link href={episode.link || `https://www.youtube.com/watch?v=${episode.youtubeId}`} target="_blank" rel="noopener noreferrer">
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                        <img
                          src={episode.thumbnailUrl}
                          alt={episode.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <svg
                              className="ml-1 h-6 w-6 text-brand"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-semibold text-white">
                          YouTube
                        </div>
                      </div>
                      <div className="p-4">
                        <h2 className="mb-2 line-clamp-2 text-sm font-semibold leading-tight text-foreground group-hover:text-brand">
                          {episode.title}
                        </h2>
                        {episode.date && (
                          <p className="text-xs text-foreground/60">
                            {formatDate(episode.date)}
                          </p>
                        )}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-12 text-center shadow-md ring-1 ring-black/5">
                <p className="text-lg text-foreground/70">Aucun épisode disponible pour le moment.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

