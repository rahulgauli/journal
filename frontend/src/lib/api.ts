import { Book } from "./types";

export async function apiLoadBooks(): Promise<Book[]> {
  const res = await fetch("/api/books");
  if (!res.ok) throw new Error("Failed to load books");
  return res.json();
}

export async function apiCreateBook(title: string, author: string, trimSizeId: string, fontPresetId: string): Promise<Book> {
  const res = await fetch("/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author, trimSizeId, fontPresetId }),
  });
  if (!res.ok) throw new Error("Failed to create book");
  return res.json();
}

export async function apiGetBook(id: string): Promise<Book> {
  const res = await fetch(`/api/books/${id}`);
  if (!res.ok) throw new Error("Failed to load book");
  return res.json();
}

export async function apiDeleteBook(id: string): Promise<void> {
  const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete book");
}

export async function apiSavePage(bookId: string, chapterId: string, pageId: string, content: string): Promise<void> {
  await fetch(`/api/books/${bookId}/chapters/${chapterId}/pages/${pageId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

export async function apiAddPage(bookId: string, chapterId: string, afterPageId: string, content = ""): Promise<{ id: string; pageNumber: number; content: string }> {
  const res = await fetch(`/api/books/${bookId}/chapters/${chapterId}/pages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ afterPageId, content }),
  });
  if (!res.ok) throw new Error("Failed to add page");
  return res.json();
}

export async function apiAddChapter(bookId: string, title?: string): Promise<{ id: string; title: string; pages: { id: string; pageNumber: number; content: string }[] }> {
  const res = await fetch(`/api/books/${bookId}/chapters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to add chapter");
  return res.json();
}

export async function apiRenameChapter(bookId: string, chapterId: string, title: string): Promise<void> {
  await fetch(`/api/books/${bookId}/chapters/${chapterId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

// Local helpers
export function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function countParagraphs(text: string): number {
  return text.split(/\n\n+/).filter((p) => p.trim() !== "").length;
}

export function getTotalWords(book: Book): number {
  return book.chapters.reduce((acc, ch) => acc + ch.pages.reduce((a, p) => a + countWords(p.content), 0), 0);
}

export function getTotalPages(book: Book): number {
  return book.chapters.reduce((acc, ch) => acc + ch.pages.length, 0);
}
