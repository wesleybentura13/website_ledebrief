import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f3f7fb] text-foreground">
      <div className="flex flex-col gap-14 pb-20">
        <div className="relative w-full bg-[#0c79c5] shadow-sm">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-8 lg:px-12">
            <Image
              src="/logo-banner.svg"
              alt="Le Debrief Podcast"
              width={320}
              height={80}
              className="h-14 w-auto object-contain"
              priority
            />
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

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 pb-16 pt-4 sm:px-6 lg:px-8">
          <div className="grid gap-2 lg:grid-cols-2">
            <div className="order-1 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 lg:order-2">
              <div className="relative">
                <Image
                  src="/images/74.png"
                  alt="Le Debrief Podcast highlight"
                  width={1600}
                  height={900}
                  className="h-auto w-full object-cover"
                  priority
                />
                <div className="absolute inset-0 flex items-end justify-end p-5 pb-6">
                  <div className="max-w-sm rounded-2xl bg-white/90 px-5 py-4 text-black shadow-[0_12px_35px_rgba(0,0,0,0.15)] ring-1 ring-black/10">
                    <p className="text-lg font-semibold leading-snug sm:text-xl text-black">
                      “Nous vous proposons nos points de vus uniques que ce soit dans le sport, le cinema ou la finance mais aussi bien d&apos;autres ...”
                    </p>
                    <p className="mt-3 text-sm font-semibold text-black/75">Wesley Bentura</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-2 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 lg:order-1">
              <div className="relative">
                <Image
                  src="/images/75.png"
                  alt="Le Debrief Podcast highlight 2"
                  width={1600}
                  height={900}
                  className="h-auto w-full object-cover"
                />
                <div className="absolute inset-0 flex items-end justify-start p-5 pb-6">
                  <div className="max-w-sm rounded-2xl bg-white/90 px-5 py-4 text-black shadow-[0_12px_35px_rgba(0,0,0,0.15)] ring-1 ring-black/10">
                    <p className="text-lg font-semibold leading-snug sm:text-xl text-black">
                      “le debrief, c&apos;est le podcast qui traite de tous les sujets à notre sauce”
                    </p>
                    <p className="mt-3 text-sm font-semibold text-black/75">Sacha Bentura</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-foreground shadow-md ring-1 ring-black/5 sm:flex-row sm:justify-center sm:gap-4">
            <span className="text-base font-semibold text-foreground">
              Écouter et suivre Le Débrief
            </span>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF0000] shadow-md transition hover:scale-110 hover:shadow-lg"
                href="https://www.youtube.com/@ledebrief_podcast"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1DB954] shadow-md transition hover:scale-110 hover:shadow-lg"
                href="https://open.spotify.com/show/2MA341D762SdA7azTQYdxw?si=8b89694c282348b0"
                target="_blank"
                rel="noreferrer"
                aria-label="Spotify"
              >
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.359.24-.66.54-.779 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </a>
              <a
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] shadow-md transition hover:scale-110 hover:shadow-lg"
                href="https://www.instagram.com/ledebrief_podcast/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                className="flex h-12 w-12 items-center justify-center rounded-full bg-black shadow-md transition hover:scale-110 hover:shadow-lg"
                href="https://www.tiktok.com/@ledebrief_podcast"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
              >
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
