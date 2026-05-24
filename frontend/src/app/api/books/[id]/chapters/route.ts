import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uid } from "@/lib/uid";
import { headers } from "next/headers";

// POST /api/books/[id]/chapters
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: bookId } = await params;

  const book = db.prepare("SELECT id FROM book WHERE id = ? AND user_id = ?").get(bookId, session.user.id);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title } = await req.json();
  const maxOrd = (db.prepare("SELECT MAX(ord) as m FROM chapter WHERE book_id = ?").get(bookId) as { m: number | null }).m ?? -1;

  // Count total pages for page numbering
  const pageCount = (db.prepare(`SELECT COUNT(*) as c FROM page p JOIN chapter c ON c.id = p.chapter_id WHERE c.book_id = ?`).get(bookId) as { c: number }).c;

  const chapterId = uid();
  const pageId = uid();
  const chapterTitle = title ?? `Chapter ${maxOrd + 2}`;

  db.transaction(() => {
    db.prepare("INSERT INTO chapter (id, book_id, title, ord) VALUES (?,?,?,?)").run(chapterId, bookId, chapterTitle, maxOrd + 1);
    db.prepare("INSERT INTO page (id, chapter_id, page_number, content, ord) VALUES (?,?,?,?,?)").run(pageId, chapterId, pageCount + 1, "", 0);
    db.prepare("UPDATE book SET updated_at = ? WHERE id = ?").run(new Date().toISOString(), bookId);
  })();

  return NextResponse.json({ id: chapterId, title: chapterTitle, pages: [{ id: pageId, pageNumber: pageCount + 1, content: "" }] }, { status: 201 });
}
