import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// PUT /api/books/[id]/chapters/[chapterId]/pages/[pageId]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string; chapterId: string; pageId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: bookId, chapterId, pageId } = await params;

  const owns = db.prepare(`
    SELECT p.id FROM page p
    JOIN chapter c ON c.id = p.chapter_id
    JOIN book b ON b.id = c.book_id
    WHERE b.id = ? AND c.id = ? AND p.id = ? AND b.user_id = ?
  `).get(bookId, chapterId, pageId, session.user.id);
  if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { content } = await req.json();
  db.prepare("UPDATE page SET content = ? WHERE id = ?").run(content, pageId);
  db.prepare("UPDATE book SET updated_at = ? WHERE id = ?").run(new Date().toISOString(), bookId);
  return NextResponse.json({ ok: true });
}
