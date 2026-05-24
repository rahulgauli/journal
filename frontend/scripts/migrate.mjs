import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dbPath = process.env.DB_PATH ?? path.join(process.cwd(), "app.db");
const db = new Database(dbPath);

// Run better-auth schema migrations
db.exec(`
  CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    "emailVerified" INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    "createdAt" INTEGER NOT NULL,
    "updatedAt" INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "session" (
    id TEXT PRIMARY KEY,
    "expiresAt" INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    "createdAt" INTEGER NOT NULL,
    "updatedAt" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"(id)
  );

  CREATE TABLE IF NOT EXISTS "account" (
    id TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"(id),
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" INTEGER,
    "refreshTokenExpiresAt" INTEGER,
    scope TEXT,
    password TEXT,
    "createdAt" INTEGER NOT NULL,
    "updatedAt" INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" INTEGER NOT NULL,
    "createdAt" INTEGER,
    "updatedAt" INTEGER
  );
`);

console.log("✓ Database migrations complete:", dbPath);
db.close();
