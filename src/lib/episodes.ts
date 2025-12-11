export type Episode = {
  slug: string;
  title: string;
  date: string;
  duration: string;
  summary: string;
  tags: string[];
  audioUrl?: string;
  transcript: string;
  youtubeId?: string;
  thumbnailUrl?: string;
};

export const episodes: Episode[] = [
  {
    slug: "prendre-la-parole",
    title: "Prendre la parole et captiver son audience",
    date: "2024-11-02",
    duration: "32:14",
    summary:
      "On partage nos coulisses : comment on prépare nos sujets, structure les épisodes et garde le rythme.",
    tags: ["coulisses", "parole", "structure"],
    audioUrl: "#",
    transcript:
      "Intro — pourquoi on lance ce format plus condensé. Wesley explique la checklist pré-enregistrement. Sacha détaille comment il prépare les relances et exemples concrets...",
  },
  {
    slug: "founders-et-feuilles-de-route",
    title: "Founders et feuilles de route : rester focus",
    date: "2024-10-10",
    duration: "28:03",
    summary:
      "Un échange sur la priorisation : ce qu’on garde, ce qu’on coupe, et comment on évite la dispersion.",
    tags: ["startup", "priorités", "mindset"],
    audioUrl: "#",
    transcript:
      "On commence par un retour d’expérience sur une roadmap ratée. Ensuite, 3 techniques pour dire non. Q&A rapide sur les outils qu’on utilise...",
  },
  {
    slug: "apprendre-plus-vite",
    title: "Apprendre plus vite : méthodes qu’on applique",
    date: "2024-09-18",
    duration: "24:50",
    summary:
      "Lectures, prise de notes, répétition espacée : on compare nos approches et partage un pack d’outils légers.",
    tags: ["apprentissage", "outils", "habitudes"],
    audioUrl: "#",
    transcript:
      "Wesley détaille son système de fiches. Sacha explique comment il utilise les rappels et les sessions courtes. On conclut par 2 erreurs à éviter...",
  },
];

export const getEpisode = (slug: string) =>
  episodes.find((episode) => episode.slug === slug);

