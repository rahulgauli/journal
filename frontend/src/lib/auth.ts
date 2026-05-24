import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import path from "node:path";

export const auth = betterAuth({
  database: new Database(path.resolve(process.cwd(), "app.db")),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    cookieCache: {
      enabled: false,
    },
  },
  onAPIError: {
    errorURL: "/auth-error",
  },
});
