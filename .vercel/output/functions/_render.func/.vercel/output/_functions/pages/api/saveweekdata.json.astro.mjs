import { d as db, W as WeekData } from '../../chunks/_astro_db_BdnJ5_v5.mjs';
import { eq } from 'drizzle-orm';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  const { weekOffset, weekData } = await request.json();
  try {
    const existingRecord = await db.select().from(WeekData).where(eq(WeekData.weekOffset, weekOffset)).execute();
    if (existingRecord.length > 0) {
      await db.update(WeekData).set({ data: weekData }).where(eq(WeekData.weekOffset, weekOffset)).execute();
    } else {
      await db.insert(WeekData).values({ weekOffset, data: weekData }).execute();
    }
    return new Response("Data saved successfully", { status: 200 });
  } catch (error) {
    console.error("Error saving data:", error);
    return new Response("Error saving data", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
