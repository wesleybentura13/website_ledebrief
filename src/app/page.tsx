import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f3f7fb] text-foreground">
      <div className="flex flex-col gap-14 pb-20">
        <div className="relative w-full bg-[#0c79c5] shadow-sm">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-8 lg:px-12">
            <div className="group relative inline-flex">
              <Image
                src="/logo-banner.svg"
                alt="Le Debrief Podcast"
                width={320}
                height={80}
                className="h-14 w-auto object-contain"
                priority
              />
              <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-[260px] -translate-x-1/2 rounded-2xl bg-white/18 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-md ring-1 ring-white/25 group-hover:block">
                “Le podcast qui traite tous les sujets à notre sauce.”
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold text-white">
              <a className="rounded-full px-3 py-2 hover:text-brand-secondary" href="#episodes">
                Episodes
              </a>
              <a className="rounded-full px-3 py-2 hover:text-brand-secondary" href="#about">
                About
              </a>
              <a className="rounded-full px-3 py-2 hover:text-brand-secondary" href="#newsletter">
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
                  <div className="max-w-sm rounded-2xl bg-white/18 px-5 py-4 text-white shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-md ring-1 ring-white/25">
                    <p className="text-lg font-semibold leading-snug sm:text-xl">
                      “Nous vous proposons nos points de vus uniques que ce soit dans le sport, le cinema ou la finance mais aussi bien d&apos;autres ...”
                    </p>
                    <p className="mt-3 text-sm font-semibold text-white/85">Wesley Bentura</p>
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
                  <div className="max-w-sm rounded-2xl bg-white/18 px-5 py-4 text-white shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-md ring-1 ring-white/25">
                    <p className="text-lg font-semibold leading-snug sm:text-xl">
                      “le debrief, c&apos;est le podcast qui traite de tous les sujets à notre sauce”
                    </p>
                    <p className="mt-3 text-sm font-semibold text-white/85">Sacha Bentura</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-foreground sm:justify-center">
            <span className="text-muted">Écouter & suivre :</span>
            <a
              className="rounded-full bg-brand px-4 py-2 text-white shadow-md transition hover:bg-brand-secondary"
              href="https://www.youtube.com/@ledebrief_podcast"
              target="_blank"
              rel="noreferrer"
            >
              YouTube
            </a>
            <a
              className="rounded-full bg-[#1DB954] px-4 py-2 text-white shadow-md transition hover:brightness-95"
              href="https://open.spotify.com/show/2MA341D762SdA7azTQYdxw?si=8b89694c282348b0"
              target="_blank"
              rel="noreferrer"
            >
              Spotify
            </a>
            <a
              className="rounded-full bg-[#E4405F] px-4 py-2 text-white shadow-md transition hover:brightness-95"
              href="https://www.instagram.com/ledebrief_podcast/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a
              className="rounded-full bg-black px-4 py-2 text-white shadow-md transition hover:brightness-110"
              href="https://www.tiktok.com/@ledebrief_podcast"
              target="_blank"
              rel="noreferrer"
            >
              TikTok
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
