"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { episodes as staticEpisodes } from "@/lib/episodes";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
  link: string;
}

export default function EpisodesPage() {
  const [youtubeEpisodes, setYoutubeEpisodes] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch YouTube episodes from the channel
    // The channel ID can be found by going to https://www.youtube.com/@ledebrief_podcast
    // View page source and search for "channelId"
    const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;
    
    if (CHANNEL_ID) {
      fetch(`/api/fetch-episodes?channelId=${CHANNEL_ID}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.episodes) {
            setYoutubeEpisodes(data.episodes);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch YouTube episodes:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Merge static episodes with YouTube data
  // If we have YouTube episodes, use those; otherwise use static episodes
  const allEpisodes = youtubeEpisodes.length > 0
    ? youtubeEpisodes.map((ytEpisode) => ({
        slug: ytEpisode.slug || `episode-${ytEpisode.id}`,
        title: ytEpisode.title,
        date: ytEpisode.publishedAt || new Date().toISOString().split('T')[0],
        duration: "", // YouTube doesn't provide duration in RSS
        summary: (ytEpisode.description || "").substring(0, 150) + (ytEpisode.description && ytEpisode.description.length > 150 ? "..." : ""),
        tags: [],
        transcript: "",
        youtubeId: ytEpisode.id,
        thumbnailUrl: ytEpisode.thumbnail,
        thumbnail: ytEpisode.thumbnail,
      }))
    : staticEpisodes.map((episode) => {
        if (episode.youtubeId) {
          return {
            ...episode,
            thumbnail: episode.thumbnailUrl || `https://img.youtube.com/vi/${episode.youtubeId}/maxresdefault.jpg`,
          };
        }
        return episode;
      });

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allEpisodes.map((episode) => (
            <article
              key={episode.slug}
              className="group overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 transition hover:shadow-xl"
            >
              {episode.youtubeId ? (
                <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                  <img
                      src={episode.thumbnail || `https://img.youtube.com/vi/${episode.youtubeId}/maxresdefault.jpg`}
                      alt={episode.title}
                      className="h-full w-full object-cover"
                    />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                      <svg
                        className="ml-1 h-6 w-6 text-brand"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-gradient-to-br from-brand to-brand-secondary" />
              )}

              <div className="p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-brand/10 px-2.5 py-1 text-brand">
                    {formatDate(episode.date)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-foreground/70">
                    {episode.duration}
                  </span>
                </div>

                <h2 className="mb-2 text-lg font-semibold leading-tight text-foreground line-clamp-2">
                  {episode.title}
                </h2>

                <p className="mb-4 text-sm leading-relaxed text-foreground/70 line-clamp-2">
                  {episode.summary}
                </p>

                {episode.youtubeId && (
                  <div className="mt-4">
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${episode.youtubeId}?rel=0`}
                        title={episode.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                )}

                <Link
                  href={`/episodes/${episode.slug}`}
                  className="mt-4 inline-block rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary"
                >
                  Voir plus
                </Link>
              </div>
            </article>
          ))}
        </div>

        {allEpisodes.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md ring-1 ring-black/5">
            <p className="text-lg text-foreground/70">Aucun épisode disponible pour le moment.</p>
          </div>
        )}
      </main>
    </div>
  );
}

