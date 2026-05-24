import { randomBytes } from "crypto";

export function uid(): string {
  return randomBytes(12).toString("base64url");
}
