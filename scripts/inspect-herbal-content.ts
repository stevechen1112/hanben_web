import "dotenv/config";
import { db } from "../src/lib/db";

const run = async () => {
  const page = await db.page.findUnique({ where: { slug: "chinese-herbal-guide" }, select: { content: true } });
  console.log(JSON.stringify(page, null, 2));
  await db.$disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
