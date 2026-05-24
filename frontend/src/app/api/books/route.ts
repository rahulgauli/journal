import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uid } from "@/lib/uid";
import { headers } from "next/headers";

function rowsToBook(rows: Record<string, unknown>[]) {
  if (!rows.length) return null;
  const first = rows[0];
  const chaptersMap = new Map<string, { id: string; title: string; pages: { id: string; pageNumber: number; content: string }[] }>();
  for (const r of rows) {
    const chId = r.chapter_id as string;
    if (chId && !chaptersMap.has(chId)) {
      chaptersMap.set(chId, { id: chId, title: r.chapter_title as string, pages: [] });
    }
    if (chId && r.page_id) {
      chaptersMap.get(chId)!.pages.push({
        id: r.page_id as string,
        pageNumber: r.page_number as number,
        content: r.content as string,
      });
    }
  }
  return {
    id: first.id,
    userId: first.user_id,
    title: first.title,
    author: first.author,
    trimSizeId: first.trim_size_id,
    fontPresetId: first.font_preset_id,
    createdAt: first.created_at,
    updatedAt: first.updated_at,
    chapters: [...chaptersMap.values()],
  };
}

// GET /api/books
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = db.prepare(`
    SELECT b.*, c.id as chapter_id, c.title as chapter_title, c.ord as chapter_ord,
           p.id as page_id, p.page_number, p.content, p.ord as page_ord
    FROM book b
    LEFT JOIN chapter c ON c.book_id = b.id
    LEFT JOIN page p ON p.chapter_id = c.id
    WHERE b.user_id = ?
    ORDER BY b.updated_at DESC, c.ord ASC, p.ord ASC
  `).all(session.user.id) as Record<string, unknown>[];

  // Group into books
  const bookMap = new Map<string, ReturnType<typeof rowsToBook>>();
  const bookOrder: string[] = [];
  for (const row of rows) {
    const bookId = row.id as string;
    if (!bookMap.has(bookId)) {
      bookOrder.push(bookId);
      bookMap.set(bookId, rowsToBook([row]));
    } else {
      const book = bookMap.get(bookId)!;
      const chId = row.chapter_id as string;
      if (chId) {
        let ch = book!.chapters.find((c) => c.id === chId);
        if (!ch) { ch = { id: chId, title: row.chapter_title as string, pages: [] }; book!.chapters.push(ch); }
        if (row.page_id && !ch.pages.find((p) => p.id === row.page_id)) {
          ch.pages.push({ id: row.page_id as string, pageNumber: row.page_number as number, content: row.content as string });
        }
      }
    }
  }

  return NextResponse.json(bookOrder.map((id) => bookMap.get(id)));
}

// POST /api/books
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, author, trimSizeId, fontPresetId } = await req.json();
  const bookId = uid();
  const chapterId = uid();
  const pageId = uid();
  const now = new Date().toISOString();

  db.transaction(() => {
    db.prepare(`INSERT INTO book (id, user_id, title, author, trim_size_id, font_preset_id, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)`)
      .run(bookId, session.user.id, title, author ?? "", trimSizeId ?? "trade_6x9", fontPresetId ?? "lora_12", now, now);
    db.prepare(`INSERT INTO chapter (id, book_id, title, ord) VALUES (?,?,?,?)`)
      .run(chapterId, bookId, "Chapter 1", 0);
    db.prepare(`INSERT INTO page (id, chapter_id, page_number, content, ord) VALUES (?,?,?,?,?)`)
      .run(pageId, chapterId, 1, "", 0);
  })();

  return NextResponse.json({
    id: bookId, userId: session.user.id, title, author: author ?? "",
    trimSizeId: trimSizeId ?? "trade_6x9", fontPresetId: fontPresetId ?? "lora_12",
    createdAt: now, updatedAt: now,
    chapters: [{ id: chapterId, title: "Chapter 1", pages: [{ id: pageId, pageNumber: 1, content: "" }] }],
  }, { status: 201 });
}
