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

import type { LucideIcon } from "lucide-react";
import {
  Lightbulb,
  BookOpen,
  Clapperboard,
  Music,
  Drama,
  Tv,
  Gamepad2,
  Dices,
  Leaf,
  Cpu,
  Calculator,
  Scroll,
  Trophy,
  Globe,
  Landmark,
  Scale,
  Palette,
  Star,
  PawPrint,
  Car,
  BookMarked,
  Bot,
  Sparkles,
  Rabbit,
  HelpCircle,
} from "lucide-react";

export const TOPIC_ICONS: Record<string, LucideIcon> = {
  "general-knowledge": Lightbulb,
  "entertainment-books": BookOpen,
  "entertainment-film": Clapperboard,
  "entertainment-music": Music,
  "entertainment-musicals-theatres": Drama,
  "entertainment-television": Tv,
  "entertainment-video-games": Gamepad2,
  "entertainment-board-games": Dices,
  "science-nature": Leaf,
  "science-computers": Cpu,
  "science-mathematics": Calculator,
  mythology: Scroll,
  sports: Trophy,
  geography: Globe,
  history: Landmark,
  politics: Scale,
  art: Palette,
  celebrities: Star,
  animals: PawPrint,
  vehicles: Car,
  "entertainment-comics": BookMarked,
  "science-gadgets": Bot,
  "entertainment-japanese-anime-manga": Sparkles,
  "entertainment-cartoon-animations": Rabbit,
};

export const topicIcon = (typeId: string | null | undefined): LucideIcon => {
  if (!typeId) return HelpCircle;
  return TOPIC_ICONS[typeId] ?? HelpCircle;
};