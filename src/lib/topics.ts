export const TOPIC_LABELS: Record<string, string> = {
  "general-knowledge": "General Knowledge",
  "entertainment-books": "Entertainment: Books",
  "entertainment-film": "Entertainment: Film",
  "entertainment-music": "Entertainment: Music",
  "entertainment-musicals-theatres": "Entertainment: Musicals & Theatres",
  "entertainment-television": "Entertainment: Television",
  "entertainment-video-games": "Entertainment: Video Games",
  "entertainment-board-games": "Entertainment: Board Games",
  "science-nature": "Science & Nature",
  "science-computers": "Science: Computers",
  "science-mathematics": "Science: Mathematics",
  mythology: "Mythology",
  sports: "Sports",
  geography: "Geography",
  history: "History",
  politics: "Politics",
  art: "Art",
  celebrities: "Celebrities",
  animals: "Animals",
  vehicles: "Vehicles",
  "entertainment-comics": "Entertainment: Comics",
  "science-gadgets": "Science: Gadgets",
  "entertainment-japanese-anime-manga": "Entertainment: Japanese Anime & Manga",
  "entertainment-cartoon-animations": "Entertainment: Cartoon & Animations",
};

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const topicLabel = (typeId: string | null | undefined) => {
  if (!typeId) return "MISC";
  return TOPIC_LABELS[typeId] ?? typeId;
};