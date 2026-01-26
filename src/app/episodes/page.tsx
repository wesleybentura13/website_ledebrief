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
  viewCount?: number;
}

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

// Format view count (e.g., 1234 -> "1.2K", 1234567 -> "1.2M")
function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to fetch YouTube episodes from the channel
    // The channel ID should be in NEXT_PUBLIC_YOUTUBE_CHANNEL_ID env variable
    const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;
    
    const fetchEpisodes = async () => {
      try {
        if (!CHANNEL_ID) {
          setError("Channel ID not configured. Please add NEXT_PUBLIC_YOUTUBE_CHANNEL_ID to .env.local");
          setLoading(false);
          return;
        }
        
        const response = await fetch(`/api/fetch-episodes?channelId=${CHANNEL_ID}`);
        const data = await response.json();
        
        if (data.episodes && data.episodes.length > 0) {
          // Sort episodes by episode number (#1, #2, #3, etc.)
          const sortedEpisodes = [...data.episodes].sort((a, b) => {
            // Extract episode number from title (e.g., "#34-" -> 34)
            const getEpisodeNumber = (title: string): number => {
              const match = title.match(/^#(\d+)/);
              return match ? parseInt(match[1], 10) : 0;
            };
            const numA = getEpisodeNumber(a.title);
            const numB = getEpisodeNumber(b.title);
          // Sort descending (newest first) - #34, #33, #32... #1
          return numB - numA;
          });
          setEpisodes(sortedEpisodes);
        } else if (data.error) {
          setError(data.error + (data.details ? `: ${data.details}` : ""));
        } else {
          setError("No episodes found");
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
              <>
                <div className="mb-4 text-sm text-foreground/70">
                  {episodes.length} épisode{episodes.length > 1 ? 's' : ''} disponible{episodes.length > 1 ? 's' : ''}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {episodes.map((episode) => {
                    const youtubeId = YOUTUBE_ID_RE.test(episode.youtubeId) ? episode.youtubeId : null;
                    const href = youtubeId
                      ? `https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}`
                      : "#";
                    const thumbnail = youtubeId
                      ? `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg`
                      : "/logo.png";

                    return (
                      <article
                        key={episode.slug}
                        className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-lg hover:ring-black/10"
                      >
                        <Link href={href} target="_blank" rel="noopener noreferrer">
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                        <img
                              src={thumbnail}
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
                        <div className="flex items-center justify-between gap-2">
                          {episode.date && (
                            <p className="text-xs text-foreground/60">
                              {formatDate(episode.date)}
                            </p>
                          )}
                          {episode.viewCount !== undefined && (
                            <p className="text-xs font-medium text-foreground/70">
                              {formatViewCount(episode.viewCount)} vues
                            </p>
                          )}
                        </div>
                      </div>
                        </Link>
                      </article>
                    );
                  })}
                </div>
              </>
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

