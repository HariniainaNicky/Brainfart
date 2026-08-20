import { prisma } from "@/lib/prisma";
import { importTriviaQuestions, syncTriviaCategories } from "@/lib/trivia";

const IMPORT_PER_CATEGORY = 20;
const RATE_LIMIT_MS = 5200;

const main = async () => {
  const categories = await syncTriviaCategories();
  console.log(`Synced ${categories.length} trivia categories`);

  for (const category of categories) {
    try {
      const imported = await importTriviaQuestions(category.id, IMPORT_PER_CATEGORY);
      console.log(`  ${category.name} (${category.id}): +${imported} questions`);
    } catch (error) {
      console.error(`  Failed to import ${category.name}:`, error);
    }
    // OpenTDB asks for ~1 request every 5 seconds per IP.
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
  }

  console.log("Done.");
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());