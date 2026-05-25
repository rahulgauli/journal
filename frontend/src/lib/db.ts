import Database from "better-sqlite3";
import path from "node:path";

const globalForDb = globalThis as unknown as { db: Database.Database };

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(process.cwd(), "app.db");

export const db: Database.Database =
  globalForDb.db || new Database(dbPath);

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

// Foreign keys on
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

// ── Books / Chapters / Pages tables ───────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS book (
    id            TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL,
    title         TEXT NOT NULL,
    author        TEXT NOT NULL DEFAULT '',
    trim_size_id  TEXT NOT NULL DEFAULT 'trade_6x9',
    font_preset_id TEXT NOT NULL DEFAULT 'lora_12',
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chapter (
    id       TEXT PRIMARY KEY,
    book_id  TEXT NOT NULL REFERENCES book(id) ON DELETE CASCADE,
    title    TEXT NOT NULL,
    ord      INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS page (
    id          TEXT PRIMARY KEY,
    chapter_id  TEXT NOT NULL REFERENCES chapter(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL DEFAULT 1,
    content     TEXT NOT NULL DEFAULT '',
    ord         INTEGER NOT NULL DEFAULT 0
  );
`);
