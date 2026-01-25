"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import NewsletterForm from "@/components/NewsletterForm";

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

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export default function Home() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("hero");
  const [episodesToShow, setEpisodesToShow] = useState(6);

  useEffect(() => {
    const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;
    
    const fetchEpisodes = async () => {
      try {
        if (!CHANNEL_ID) {
          setLoading(false);
          return;
        }
        
        const response = await fetch(`/api/fetch-episodes?channelId=${CHANNEL_ID}`);
        const data = await response.json();
        
        if (data.episodes && data.episodes.length > 0) {
          const sortedEpisodes = [...data.episodes].sort((a, b) => {
            const getEpisodeNumber = (title: string): number => {
              const match = title.match(/^#(\d+)/);
              return match ? parseInt(match[1], 10) : 0;
            };
            return getEpisodeNumber(b.title) - getEpisodeNumber(a.title);
          });
          setEpisodes(sortedEpisodes); // Store all episodes
        }
      } catch (err) {
        console.error("Failed to fetch episodes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();

    // Smooth scroll handler
    const handleScroll = () => {
      const sections = ["hero", "about", "episodes", "newsletter"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image
              src="/logo-banner.svg"
              alt="Le Debrief Podcast"
              width={160}
              height={40}
              className="h-8 w-auto object-contain brightness-0 invert sm:h-10"
              priority
            />
          </Link>
          {/* Mobile & Desktop Navigation */}
          <div className="flex items-center gap-4 sm:gap-8">
            <button
              onClick={() => scrollToSection("about")}
              className={`text-xs sm:text-sm font-medium transition-colors ${
                activeSection === "about" ? "text-[#00e0d1]" : "text-white/70 hover:text-white"
              }`}
            >
              À propos
            </button>
            <button
              onClick={() => scrollToSection("episodes")}
              className={`text-xs sm:text-sm font-medium transition-colors ${
                activeSection === "episodes" ? "text-[#00e0d1]" : "text-white/70 hover:text-white"
              }`}
            >
              Épisodes
            </button>
            <button
              onClick={() => scrollToSection("newsletter")}
              className={`text-xs sm:text-sm font-medium transition-colors ${
                activeSection === "newsletter" ? "text-[#00e0d1]" : "text-white/70 hover:text-white"
              }`}
            >
              Newsletter
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,224,209,0.15),transparent_50%)] animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(12,121,197,0.1),transparent_50%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-16 text-center">
          {/* Social Links - Moved to top */}
          <div className="mb-6 sm:mb-8 flex items-center justify-center gap-4 sm:gap-6">
            <a
              href="https://www.youtube.com/@ledebrief_podcast"
              target="_blank"
              rel="noreferrer"
              className="group flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#FF0000] transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(255,0,0,0.5)]"
              aria-label="YouTube"
            >
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a
              href="https://open.spotify.com/show/2MA341D762SdA7azTQYdxw?si=8b89694c282348b0"
              target="_blank"
              rel="noreferrer"
              className="group flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#1DB954] transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(29,185,84,0.5)]"
              aria-label="Spotify"
            >
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.359.24-.66.54-.779 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/ledebrief_podcast/"
              target="_blank"
              rel="noreferrer"
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(253,29,29,0.5)]"
              aria-label="Instagram"
            >
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@ledebrief_podcast"
              target="_blank"
              rel="noreferrer"
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-black border border-white/20 transition-all hover:scale-110 hover:border-white/40"
              aria-label="TikTok"
            >
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
          
          <div className="mb-8 inline-block">
            <span className="rounded-full border border-[#00e0d1]/30 bg-[#00e0d1]/10 px-6 py-2 text-sm font-medium text-[#00e0d1] backdrop-blur-sm">
              Podcast hebdomadaire
            </span>
          </div>
          
          <div className="mb-6 relative flex items-center justify-center">
            {/* SVG Logo with gradient overlay to match brand colors */}
            <div className="relative inline-block w-full max-w-4xl">
              <Image
                src="/logo2.svg"
                alt="le débrief"
                width={851}
                height={315}
                className="h-auto w-full object-contain"
                priority
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(0, 224, 209, 0.4))',
                }}
              />
              {/* Gradient overlay matching the text gradient - applied via CSS mask */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(to right, rgba(255,255,255,0.4) 0%, rgba(0,224,209,0.6) 50%, rgba(255,255,255,0.4) 100%)',
                  mixBlendMode: 'overlay',
                  WebkitMaskImage: 'url(/logo2.svg)',
                  maskImage: 'url(/logo2.svg)',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }}
              />
            </div>
          </div>
          
          <p className="mx-auto mb-12 max-w-2xl text-xl text-white/80 md:text-2xl">
            Le podcast qui traite de tous les sujets à notre sauce. 
            Sport, cinéma, finance et bien plus encore.
          </p>

          {/* Host Quotes */}
          <div className="mx-auto mb-16 grid max-w-4xl gap-6 md:grid-cols-2">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00e0d1]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <p className="relative text-lg italic text-white/90 md:text-xl">
                &ldquo;Nous décortiquons l&apos;actualité avec nos perspectives uniques sur le sport, le cinéma, la finance et bien d&apos;autres sujets. Chaque épisode, c&apos;est notre vision authentique et sans filtre.&rdquo;
              </p>
              <p className="relative mt-4 text-sm font-semibold text-[#00e0d1]">Wesley Bentura</p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0c79c5]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <p className="relative text-lg italic text-white/90 md:text-xl">
                &ldquo;Le Débrief, c&apos;est notre façon de traiter tous les sujets qui nous passionnent. Pas de formatage, pas de langue de bois : juste nos vraies opinions et nos débats authentiques.&rdquo;
              </p>
              <p className="relative mt-4 text-sm font-semibold text-[#0c79c5]">Sacha Bentura</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <span className="text-sm text-white/60">Écouter sur :</span>
            <div className="flex items-center justify-center gap-4">
            <a
              href="https://www.youtube.com/@ledebrief_podcast"
              target="_blank"
              rel="noreferrer"
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#FF0000] transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(255,0,0,0.5)]"
              aria-label="YouTube"
            >
              <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a
              href="https://open.spotify.com/show/2MA341D762SdA7azTQYdxw?si=8b89694c282348b0"
              target="_blank"
              rel="noreferrer"
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#1DB954] transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(29,185,84,0.5)]"
              aria-label="Spotify"
            >
              <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.359.24-.66.54-.779 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/ledebrief_podcast/"
              target="_blank"
              rel="noreferrer"
              className="group flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(253,29,29,0.5)]"
              aria-label="Instagram"
            >
              <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@ledebrief_podcast"
              target="_blank"
              rel="noreferrer"
              className="group flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-black border border-white/20 transition-all hover:scale-110 hover:border-white/40"
              aria-label="TikTok"
            >
              <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-8 w-[2px] bg-gradient-to-b from-[#00e0d1] to-transparent" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block text-sm font-medium uppercase tracking-wider text-[#00e0d1]">
              À propos
            </span>
            <h2 className="text-5xl font-bold md:text-7xl">Qui sommes-nous ?</h2>
          </div>

          {/* Podcast Cover Image */}
          <div className="mb-16 flex justify-center">
            <div className="relative group overflow-hidden rounded-3xl border border-white/20 bg-white/5 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-[#00e0d1]/50 hover:shadow-[0_0_40px_rgba(0,224,209,0.3)]">
              <Image
                src="/logo.png"
                alt="Wesley & Sacha Bentura - Le Débrief Podcast"
                width={1200}
                height={675}
                className="h-auto w-full max-w-3xl object-contain"
                priority
              />
              {/* Subtle overlay to match dark theme */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="mb-16 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:p-12">
            <p className="mb-6 text-xl leading-relaxed text-white/90 md:text-2xl font-semibold">
              On parle de tout. Sans filtre. Sans langue de bois.
            </p>
            <p className="mb-4 text-lg leading-relaxed text-white/80 md:text-xl">
              Sport, cinéma, finance, actualité... Chaque semaine, on décortique les sujets 
              qui nous passionnent avec nos vraies opinions et nos vrais débats.
            </p>
            <p className="text-lg leading-relaxed text-white/80 md:text-xl">
              Pas de formatage. Pas de discours préfabriqué. Juste deux frères, 
              deux perspectives uniques, et des conversations authentiques qui vous 
              donnent matière à réfléchir.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Wesley */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#00e0d1]/10 to-white/5 p-6 sm:p-8 backdrop-blur-sm transition-all hover:border-[#00e0d1]/30 hover:scale-[1.02]">
              <div className="relative mb-6 flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 mb-4 sm:mb-0 overflow-hidden rounded-full border-2 border-[#00e0d1]/30 shrink-0">
                  <Image
                    src="/images/74.png"
                    alt="Wesley Bentura"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Wesley Bentura</h3>
                  <p className="text-sm sm:text-base text-[#00e0d1]">Ingénieur en technologie</p>
                </div>
              </div>
              <p className="mb-4 leading-relaxed text-sm sm:text-base text-white/80">
                Originaire de Nice, Wesley est ingénieur dans une entreprise technologique. 
                Passionné par l&apos;innovation et les nouvelles technologies, il apporte une 
                perspective technique et analytique au podcast.
              </p>
              <p className="mb-6 leading-relaxed text-sm sm:text-base text-white/80">
                Son parcours l&apos;a mené de la France à la Chine, où il a développé une 
                expérience internationale enrichissante, avant de s&apos;installer en Israël.
              </p>
              <div className="flex justify-center sm:justify-start">
                <a
                  href="https://www.linkedin.com/in/wesleybentura/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0077B5] transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(0,119,181,0.5)]"
                  aria-label="LinkedIn de Wesley Bentura"
                >
                  <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Sacha */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c79c5]/10 to-white/5 p-6 sm:p-8 backdrop-blur-sm transition-all hover:border-[#0c79c5]/30 hover:scale-[1.02]">
              <div className="relative mb-6 flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 mb-4 sm:mb-0 overflow-hidden rounded-full border-2 border-[#0c79c5]/30 shrink-0">
                  <Image
                    src="/images/75.png"
                    alt="Sacha Bentura"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Sacha Bentura</h3>
                  <p className="text-sm sm:text-base text-[#0c79c5]">Professeur de mathématiques</p>
                </div>
              </div>
              <p className="mb-4 leading-relaxed text-sm sm:text-base text-white/80">
                Originaire de Nice, Sacha est professeur de mathématiques. Sa passion pour 
                l&apos;enseignement et sa capacité à expliquer des concepts complexes de manière 
                accessible enrichissent nos conversations.
              </p>
              <p className="mb-6 leading-relaxed text-sm sm:text-base text-white/80">
                Installé en Belgique, il apporte une perspective pédagogique et une approche 
                méthodique à nos débats.
              </p>
              <div className="flex justify-center sm:justify-start">
                <a
                  href="https://www.linkedin.com/in/sacha-bentura-47854421b/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0077B5] transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(0,119,181,0.5)]"
                  aria-label="LinkedIn de Sacha Bentura"
                >
                  <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes Section */}
      <section id="episodes" className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block text-sm font-medium uppercase tracking-wider text-[#00e0d1]">
              Épisodes
            </span>
            <h2 className="text-5xl font-bold md:text-7xl">Derniers épisodes</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00e0d1] border-t-transparent" />
            </div>
          ) : episodes.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {episodes.slice(0, episodesToShow).map((episode, index) => (
                  <a
                    key={episode.slug}
                    href={episode.link || `https://www.youtube.com/watch?v=${episode.youtubeId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-[#00e0d1]/30"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={episode.thumbnailUrl}
                        alt={episode.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF0000] shadow-lg">
                          <svg className="ml-1 h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 line-clamp-2 text-lg font-bold text-white group-hover:text-[#00e0d1] transition-colors">
                        {episode.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-white/60">
                        {episode.date && <span>{formatDate(episode.date)}</span>}
                        {episode.viewCount !== undefined && (
                          <span>{formatViewCount(episode.viewCount)} vues</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {episodes.length > episodesToShow && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => setEpisodesToShow(episodes.length)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-white transition-all hover:border-[#00e0d1]/50 hover:bg-[#00e0d1]/10 hover:scale-105"
                  >
                    Voir tous les épisodes ({episodes.length - episodesToShow} de plus)
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}

              {episodesToShow >= episodes.length && episodes.length > 6 && (
                <div className="mt-8 text-center">
                  <p className="text-white/60">
                    Affichage de tous les {episodes.length} épisodes
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
              <p className="text-lg text-white/80">Aucun épisode disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="newsletter" className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#00e0d1]/10 via-white/5 to-[#0c79c5]/10 p-12 backdrop-blur-sm md:p-16">
            <div className="mb-8 text-center">
              <span className="mb-4 inline-block text-sm font-medium uppercase tracking-wider text-[#00e0d1]">
                Newsletter
              </span>
              <h2 className="mb-4 text-4xl font-bold md:text-6xl">
                Restez informé
              </h2>
              <p className="text-lg text-white/80 md:text-xl">
                Recevez chaque semaine un résumé exclusif de nos derniers épisodes directement dans votre boîte mail.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-white/60">
            © {new Date().getFullYear()} Le Débrief Podcast. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}






