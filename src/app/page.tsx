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
              <Image
                src="/images/74.png"
                alt="Le Debrief Podcast highlight"
                width={1600}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
            <div className="order-2 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 lg:order-1">
              <Image
                src="/images/75.png"
                alt="Le Debrief Podcast highlight 2"
                width={1600}
                height={900}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
