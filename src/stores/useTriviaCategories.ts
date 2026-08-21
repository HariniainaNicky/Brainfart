import { create } from "zustand";

export type TriviaCategory = {
  id: string;
  name: string;
  apiCategoryId: number;
};

type TriviaCategoriesStore = {
  categories: TriviaCategory[] | null;
  setCategories: (categories: TriviaCategory[]) => void;
};

export const useTriviaCategories = create<TriviaCategoriesStore>((set) => ({
  categories: null,
  setCategories: (categories) => set({ categories }),
}));
