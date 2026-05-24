import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uid } from "@/lib/uid";
import { headers } from "next/headers";

// POST /api/books/[id]/chapters/[chapterId]/pages
export async function POST(req: Request, { params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: bookId, chapterId } = await params;

  const owns = db.prepare("SELECT b.id FROM book b JOIN chapter c ON c.book_id = b.id WHERE b.id = ? AND c.id = ? AND b.user_id = ?").get(bookId, chapterId, session.user.id);
  if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { content, afterPageId } = await req.json();
  const maxOrd = (db.prepare("SELECT MAX(ord) as m FROM page WHERE chapter_id = ?").get(chapterId) as { m: number | null }).m ?? -1;
  const pageCount = (db.prepare(`SELECT COUNT(*) as c FROM page p JOIN chapter c ON c.id = p.chapter_id WHERE c.book_id = ?`).get(bookId) as { c: number }).c;

  // Find insertion index
  let insertOrd = maxOrd + 1;
  if (afterPageId) {
    const after = db.prepare("SELECT ord FROM page WHERE id = ?").get(afterPageId) as { ord: number } | undefined;
    if (after) {
      // Shift pages after insertion point
      db.prepare("UPDATE page SET ord = ord + 1 WHERE chapter_id = ? AND ord > ?").run(chapterId, after.ord);
      insertOrd = after.ord + 1;
    }
  }

  const pageId = uid();
  db.prepare("INSERT INTO page (id, chapter_id, page_number, content, ord) VALUES (?,?,?,?,?)").run(pageId, chapterId, pageCount + 1, content ?? "", insertOrd);
  db.prepare("UPDATE book SET updated_at = ? WHERE id = ?").run(new Date().toISOString(), bookId);

  return NextResponse.json({ id: pageId, pageNumber: pageCount + 1, content: content ?? "" }, { status: 201 });
}
