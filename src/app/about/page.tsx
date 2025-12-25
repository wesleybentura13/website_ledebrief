import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
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
            <a className="rounded-full px-3 py-2 hover:text-brand-secondary" href="/#newsletter">
              Newsletter
            </a>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Podcast Description */}
        <section className="mb-16">
          <h1 className="mb-6 text-4xl font-semibold text-foreground">À propos du podcast</h1>
          <div className="rounded-2xl bg-white p-8 shadow-md ring-1 ring-black/5">
            <p className="mb-4 text-lg leading-relaxed text-foreground">
              Le Débrief, c&apos;est le podcast qui traite de tous les sujets à notre sauce. 
              Nous vous proposons nos points de vue uniques que ce soit dans le sport, le cinéma, 
              la finance, mais aussi bien d&apos;autres domaines.
            </p>
            <p className="text-lg leading-relaxed text-foreground">
              Chaque semaine, nous décortiquons l&apos;actualité, partageons nos réflexions et 
              vous offrons une perspective différente sur les sujets qui nous passionnent. 
              Notre objectif ? Vous faire découvrir des angles de vue originaux et vous tenir 
              informé de manière authentique et décontractée.
            </p>
          </div>
        </section>

        {/* Hosts Section */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-semibold text-foreground">Qui sommes-nous ?</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Wesley */}
            <div className="rounded-2xl bg-white p-8 shadow-md ring-1 ring-black/5">
              <div className="mb-6 flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-brand to-brand-secondary">
                  <Image
                    src="/images/74.png"
                    alt="Wesley Bentura"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">Wesley Bentura</h3>
                  <p className="text-foreground/70">Ingénieur en technologie</p>
                </div>
              </div>
              <p className="mb-4 leading-relaxed text-foreground">
                Originaire de Nice, Wesley est ingénieur dans une entreprise technologique. 
                Passionné par l&apos;innovation et les nouvelles technologies, il apporte une 
                perspective technique et analytique au podcast.
              </p>
              <p className="mb-6 leading-relaxed text-foreground">
                Son parcours l&apos;a mené de la France à la Chine, où il a développé une 
                expérience internationale enrichissante, avant de s&apos;installer en Israël. 
                Cette diversité culturelle et professionnelle nourrit ses réflexions et apporte 
                une dimension unique à nos discussions.
              </p>
              <a
                href="https://www.linkedin.com/in/wesleybentura/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0077B5] shadow-md transition hover:scale-110 hover:shadow-lg"
                aria-label="LinkedIn de Wesley Bentura"
              >
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>

            {/* Sacha */}
            <div className="rounded-2xl bg-white p-8 shadow-md ring-1 ring-black/5">
              <div className="mb-6 flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-brand to-brand-secondary">
                  <Image
                    src="/images/75.png"
                    alt="Sacha Bentura"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">Sacha Bentura</h3>
                  <p className="text-foreground/70">Professeur de mathématiques</p>
                </div>
              </div>
              <p className="mb-4 leading-relaxed text-foreground">
                Originaire de Nice, Sacha est professeur de mathématiques. Sa passion pour 
                l&apos;enseignement et sa capacité à expliquer des concepts complexes de manière 
                accessible enrichissent nos conversations.
              </p>
              <p className="mb-6 leading-relaxed text-foreground">
                Installé en Belgique, il apporte une perspective pédagogique et une approche 
                méthodique à nos débats. Son expérience dans l&apos;éducation lui permet de 
                décortiquer les sujets avec clarté et de faire le lien entre théorie et pratique.
              </p>
              <a
                href="https://www.linkedin.com/in/sacha-bentura-47854421b/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0077B5] shadow-md transition hover:scale-110 hover:shadow-lg"
                aria-label="LinkedIn de Sacha Bentura"
              >
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="rounded-2xl bg-gradient-to-br from-brand/10 via-brand-accent/10 to-white p-8 shadow-md ring-1 ring-black/5">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Notre histoire</h2>
          <p className="mb-4 leading-relaxed text-foreground">
            Frères originaires de Nice, nous avons chacun suivi nos propres chemins professionnels 
            et géographiques, mais notre passion commune pour l&apos;échange d&apos;idées et le 
            partage de perspectives nous a réunis autour de ce projet.
          </p>
          <p className="leading-relaxed text-foreground">
            De Nice à Bruxelles pour Sacha, de Nice à la Chine puis à Israël pour Wesley, 
            nos parcours différents enrichissent nos conversations et nous permettent d&apos;aborder 
            chaque sujet avec des angles variés. Le Débrief est né de cette envie de partager 
            nos réflexions et de créer un espace de discussion authentique et accessible.
          </p>
        </section>
      </main>
    </div>
  );
}

