import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// PATCH /api/books/[id]/chapters/[chapterId] — rename
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: bookId, chapterId } = await params;

  const owns = db.prepare("SELECT b.id FROM book b JOIN chapter c ON c.book_id = b.id WHERE b.id = ? AND c.id = ? AND b.user_id = ?").get(bookId, chapterId, session.user.id);
  if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title } = await req.json();
  db.prepare("UPDATE chapter SET title = ? WHERE id = ?").run(title, chapterId);
  db.prepare("UPDATE book SET updated_at = ? WHERE id = ?").run(new Date().toISOString(), bookId);
  return NextResponse.json({ ok: true });
}
