import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// DELETE /api/books/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const book = db.prepare("SELECT id FROM book WHERE id = ? AND user_id = ?").get(id, session.user.id);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  db.prepare("DELETE FROM book WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}

// GET /api/books/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const rows = db.prepare(`
    SELECT b.*, c.id as chapter_id, c.title as chapter_title, c.ord as chapter_ord,
           p.id as page_id, p.page_number, p.content, p.ord as page_ord
    FROM book b
    LEFT JOIN chapter c ON c.book_id = b.id
    LEFT JOIN page p ON p.chapter_id = c.id
    WHERE b.id = ? AND b.user_id = ?
    ORDER BY c.ord ASC, p.ord ASC
  `).all(id, session.user.id) as Record<string, unknown>[];

  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build book object
  const first = rows[0];
  const chaptersMap = new Map<string, { id: string; title: string; pages: { id: string; pageNumber: number; content: string }[] }>();
  for (const r of rows) {
    const chId = r.chapter_id as string;
    if (chId && !chaptersMap.has(chId)) chaptersMap.set(chId, { id: chId, title: r.chapter_title as string, pages: [] });
    if (chId && r.page_id) {
      const ch = chaptersMap.get(chId)!;
      if (!ch.pages.find((p) => p.id === r.page_id)) {
        ch.pages.push({ id: r.page_id as string, pageNumber: r.page_number as number, content: r.content as string });
      }
    }
  }
  return NextResponse.json({
    id: first.id, userId: first.user_id, title: first.title, author: first.author,
    trimSizeId: first.trim_size_id, fontPresetId: first.font_preset_id,
    createdAt: first.created_at, updatedAt: first.updated_at,
    chapters: [...chaptersMap.values()],
  });
}
