import Link from "next/link";
import { notFound } from "next/navigation";
import { getEpisode } from "@/lib/episodes";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

export default function EpisodePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const episode = getEpisode(slug);

  if (!episode) return notFound();

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-foreground">
      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 pb-20 pt-12 sm:px-8">
        <Link
          href="/#episodes"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand hover:text-brand-secondary"
        >
          ← Retour aux épisodes
        </Link>

        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-secondary p-[1px] shadow-[0_20px_60px_rgba(0,48,94,0.16)]">
          <div className="h-full rounded-[28px] bg-white p-8 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-brand">
                {formatDate(episode.date)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-foreground/80">
                {episode.duration}
              </span>
              <span className="rounded-full bg-brand-accent/20 px-3 py-1 text-foreground/80">
                Transcription incluse
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-foreground">
              {episode.title}
            </h1>
            <p className="mt-3 text-lg text-muted">{episode.summary}</p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-brand-secondary"
              >
                ▶️ Écouter l’épisode
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-base font-semibold text-foreground transition hover:bg-slate-50"
              >
                Télécharger la transcription (PDF)
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <h2 className="text-xl font-semibold text-foreground">
              Transcription
            </h2>
            <p className="mt-3 leading-relaxed text-foreground/80 whitespace-pre-line">
              {episode.transcript}
            </p>
          </article>
          <aside className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <h3 className="text-lg font-semibold text-foreground">
              Notes rapides
            </h3>
            <ul className="mt-3 space-y-2 text-muted">
              <li>• Points clés résumés</li>
              <li>• Liens et ressources</li>
              <li>• Idées à tester dès aujourd’hui</li>
            </ul>
            <div className="mt-6 rounded-xl bg-gradient-to-br from-brand/10 via-brand-accent/10 to-white px-4 py-5 text-sm text-foreground/85">
              Tu veux recevoir ce genre de notes par email ?
              <Link
                href="/#newsletter"
                className="ml-2 font-semibold text-brand hover:text-brand-secondary"
              >
                Inscris-toi à la newsletter
              </Link>
              .
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

