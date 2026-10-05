/**
 * Care guide API.
 *   GET /api/care-guides/monstera                   ->  { slug, title, body, schedule: null }
 *   GET /api/care-guides/monstera?last=2026-03-01   ->  same, plus next watering and feeding days
 *
 * Guides are markdown files in app/content/care-guides/<slug>.md with a small frontmatter block.
 * This route is where the file system, the HTTP layer and the schedule math in lib/care meet.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { nextFeedingDate, nextWateringDate } from "@/lib/care/schedule";

export const dynamic = "force-dynamic";

const GUIDES_DIR = path.join(process.cwd(), "content", "care-guides");

type GuideMeta = { title?: string; waterEveryDays?: number; feedEveryMonths?: number };

/** Split "---\nkey: value\n---\nbody" into its frontmatter fields and the markdown body. */
function parseGuide(raw: string): { meta: GuideMeta; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string | number> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    if (!key || !value) continue;
    meta[key.trim()] = Number.isNaN(Number(value)) ? value : Number(value);
  }
  return { meta: meta as GuideMeta, body: match[2].trim() };
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let raw: string;
  try {
    raw = await readFile(path.join(GUIDES_DIR, `${slug}.md`), "utf8");
  } catch {
    return Response.json({ error: "Guide not found" }, { status: 404 });
  }

  const { meta, body } = parseGuide(raw);
  const last = new URL(request.url).searchParams.get("last");

  let schedule = null;
  if (last && meta.waterEveryDays && meta.feedEveryMonths) {
    try {
      schedule = {
        nextWatering: nextWateringDate(last, meta.waterEveryDays),
        nextFeeding: nextFeedingDate(last, meta.feedEveryMonths),
      };
    } catch {
      return Response.json({ error: "Use a date like 2026-03-14 for ?last=" }, { status: 400 });
    }
  }

  return Response.json({ slug, title: meta.title ?? slug, body, schedule });
}
