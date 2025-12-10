import Image from "next/image";
import Link from "next/link";
import { episodes } from "@/lib/episodes";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const latestEpisode = episodes[0];

const listeningLinks = [
  { label: "Spotify", href: "https://open.spotify.com/", icon: "🎧" },
  { label: "Apple Podcasts", href: "https://podcasts.apple.com/", icon: "🍎" },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@ledebrief_podcast",
    icon: "▶️",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f3f7fb] text-foreground">
      <div className="flex flex-col gap-14 pb-20">
        <div className="w-full bg-gradient-to-br from-brand to-brand-secondary text-white shadow-[0_28px_80px_rgba(0,48,94,0.25)]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-12 pt-8 sm:px-8 lg:px-12">
            <Header />
            <section className="grid items-center gap-10 rounded-[28px] bg-white/5 px-8 py-10 sm:grid-cols-[1.3fr_1fr] sm:px-10">
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/30 bg-white/20">
                    <Image
                      src="/logo.png"
                      alt="Le Debrief Podcast"
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-white/90">
                  Le Debrief Podcast
                </span>
                </div>
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  Le podcast qui décortique les routines et idées pour avancer plus
                  vite.
                </h1>
                <p className="max-w-2xl text-lg text-white/85">
                  Avec Wesley & Sacha Bentura. Des conversations franches, des
                  méthodes concrètes, des invités inspirants. Transcriptions et
                  notes dispo à chaque épisode.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-base font-semibold text-brand shadow-md transition hover:shadow-lg"
                    href="#dernier-episode"
                  >
                    Écouter le dernier épisode
                  </a>
                  <a
                    className="inline-flex items-center gap-2 rounded-full border border-white/70 px-5 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                    href="#newsletter"
                  >
                    S’abonner à la newsletter
                  </a>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-white/85">
                  {listeningLinks.map((item) => (
                    <a
                      key={item.label}
                      className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 transition hover:bg-white/18"
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span aria-hidden>{item.icon}</span>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-3xl" />
                <div className="absolute -right-10 bottom-2 h-40 w-40 rounded-full bg-brand-accent/35 blur-3xl" />
                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur">
                  <div className="flex items-center justify-between px-5 py-4 text-sm text-white/80">
                    <span>Dernier extrait</span>
                    <span className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                      🎙️ Wesley & Sacha
                    </span>
                  </div>
                  <div className="space-y-3 bg-white/5 px-5 py-6 text-white">
                    <h3 className="text-xl font-semibold leading-snug">
                      Gérer ses priorités et rester focus au quotidien
                    </h3>
                    <p className="text-white/80">
                      Un extrait de l’épisode à paraître cette semaine. Notes et
                      transcription disponibles dès la sortie.
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-white/75">
                      <span className="rounded-full bg-white/12 px-3 py-1">
                        30 min
                      </span>
                      <span className="rounded-full bg-white/12 px-3 py-1">
                        Transcription incluse
                      </span>
                      <span className="rounded-full bg-white/12 px-3 py-1">
                        Français
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 sm:px-8 lg:px-12">
          <section
            id="dernier-episode"
            className="grid gap-6 rounded-3xl bg-card p-7 shadow-lg ring-1 ring-black/5 sm:grid-cols-[1.1fr_0.9fr] sm:p-10"
          >
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                Dernier épisode
              </p>
              <h2 className="text-3xl font-semibold text-foreground">
                {latestEpisode.title}
              </h2>
              <p className="text-muted">{latestEpisode.summary}</p>
              <div className="flex flex-wrap gap-2 text-sm text-muted">
                <span className="rounded-full bg-brand/10 px-3 py-1 text-brand">
                  {formatDate(latestEpisode.date)}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-foreground/80">
                  {latestEpisode.duration}
                </span>
                <span className="rounded-full bg-brand-accent/20 px-3 py-1 text-foreground/80">
                  Transcription incluse
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={`/episodes/${latestEpisode.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-brand-secondary"
                >
                  ▶️ Écouter & lire
                </Link>
                {listeningLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-slate-50"
                  >
                    <span aria-hidden>{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-brand/8 via-brand-accent/10 to-white px-6 py-7 ring-1 ring-black/5">
              <h3 className="text-lg font-semibold text-foreground">Notes express</h3>
              <ul className="mt-3 space-y-3 text-muted">
                <li>• 3 points clés à appliquer dès aujourd’hui</li>
                <li>• Outils et liens évoqués</li>
                <li>• Lien direct vers la transcription intégrale</li>
              </ul>
              <Link
                href={`/episodes/${latestEpisode.slug}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-secondary"
              >
                Ouvrir l’épisode
                <span aria-hidden>→</span>
              </Link>
            </div>
          </section>

          <section className="space-y-6" id="episodes">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                  Tous les épisodes
                </p>
                <h2 className="text-3xl font-semibold text-foreground">
                  Découvrir Le Debrief
                </h2>
                <p className="text-muted">
                  Parcours les derniers échanges, chaque épisode est prêt à être lu
                  et écouté.
                </p>
              </div>
              <Link
                href="#newsletter"
                className="inline-flex items-center gap-2 rounded-full border border-brand px-4 py-2 text-brand transition hover:bg-brand hover:text-white"
              >
                Recevoir les nouveaux épisodes
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {episodes.map((episode) => (
                <article
                  key={episode.slug}
                  className="group flex h-full flex-col gap-4 rounded-2xl bg-card p-6 shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-foreground/80">
                        {formatDate(episode.date)}
                      </span>
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-brand">
                        {episode.duration}
                      </span>
                    </div>
                    <Link
                      href={`/episodes/${episode.slug}`}
                      className="text-sm font-semibold text-brand hover:text-brand-secondary"
                    >
                      Écouter
                    </Link>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-brand">
                      {episode.title}
                    </h3>
                    <p className="text-muted">{episode.summary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {episode.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm text-foreground/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-2 text-sm">
                    <Link
                      href={`/episodes/${episode.slug}`}
                      className="inline-flex items-center gap-2 font-semibold text-brand hover:text-brand-secondary"
                    >
                      Transcription
                      <span aria-hidden>→</span>
                    </Link>
                    <span className="text-muted">Disponible en PDF bientôt</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            id="newsletter"
            className="grid gap-8 rounded-3xl bg-card p-8 shadow-md ring-1 ring-black/5 sm:grid-cols-[1.1fr_0.9fr] sm:p-12"
          >
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                Newsletter
              </p>
              <h3 className="text-3xl font-semibold text-foreground">
                Un seul mail, le dimanche matin.
              </h3>
              <p className="text-lg text-muted">
                Les points forts des épisodes, les outils cités, et un condensé
                actionnable.
              </p>
              <ul className="grid gap-2 text-muted">
                <li className="flex items-center gap-2">
                  <span className="text-brand">•</span> Résumés courts + liens
                  directs.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand">•</span> Pas de spam, désinscription
                  en un clic.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand">•</span> Les coulisses du podcast.
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="https://www.youtube.com/@ledebrief_podcast"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-slate-50"
                >
                  ▶️ Voir nos coulisses sur YouTube
                </a>
              </div>
            </div>
            <NewsletterCard />
          </section>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 px-6 py-4 shadow-md ring-1 ring-black/5 backdrop-blur">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Le Debrief Podcast" width={48} height={48} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Le Debrief Podcast
          </p>
          <p className="text-base font-semibold text-foreground">
            Wesley & Sacha Bentura
          </p>
        </div>
      </div>
      <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-muted">
        <a className="rounded-full px-3 py-2 hover:text-brand" href="#episodes">
          Épisodes
        </a>
        <a className="rounded-full px-3 py-2 hover:text-brand" href="#newsletter">
          Newsletter
        </a>
        <a
          className="rounded-full px-3 py-2 hover:text-brand"
          href="https://www.youtube.com/@ledebrief_podcast"
          target="_blank"
          rel="noreferrer"
        >
          YouTube
        </a>
        <Link
          href="#dernier-episode"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-white shadow-sm transition hover:bg-brand-secondary"
        >
          ▶️ Dernier épisode
        </Link>
      </nav>
    </header>
  );
}

function NewsletterCard() {
  return (
    <form
      action="/api/newsletter"
      method="post"
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-[0_12px_35px_rgba(15,23,42,0.08)]"
    >
      <div className="space-y-1">
        <h4 className="text-xl font-semibold text-foreground">Rejoindre la liste</h4>
        <p className="text-muted text-sm">
          Laisse ton email, on t’envoie les prochains épisodes et résumés.
        </p>
      </div>
      <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
        Email
        <input
          required
          type="email"
          name="email"
          className="rounded-lg border border-slate-200 px-3 py-3 text-base outline-none ring-brand/30 focus:ring-2"
          placeholder="prenom@email.com"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
        Prénom
        <input
          type="text"
          name="firstName"
          className="rounded-lg border border-slate-200 px-3 py-3 text-base outline-none ring-brand/30 focus:ring-2"
          placeholder="Ton prénom"
        />
      </label>
      <button
        type="submit"
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-brand-secondary"
      >
        Je m’abonne
      </button>
      <p className="text-xs text-muted">
        En t’inscrivant, tu recevras nos emails. Tu peux te désinscrire en un
        clic.
      </p>
    </form>
  );
}
