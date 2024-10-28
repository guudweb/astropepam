import { d as db, W as WeekData } from '../../chunks/_astro_db_BdnJ5_v5.mjs';
import { eq } from 'drizzle-orm';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request }) => {
  const url = new URL(request.url);
  const weekOffsetParam = url.searchParams.get("weekOffset");
  if (weekOffsetParam === null) {
    return new Response("weekOffset parameter is missing", { status: 400 });
  }
  const weekOffset = parseInt(weekOffsetParam, 10);
  const result = await db.select().from(WeekData).where(eq(WeekData.weekOffset, weekOffset)).execute();
  return new Response(JSON.stringify(result[0]?.data || {}), { status: 200 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
