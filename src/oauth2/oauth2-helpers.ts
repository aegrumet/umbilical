import { Context, SHA256 } from "../../deps.ts";
import { OauthClientKey, OauthClientKeySchema } from "../interfaces/oauth2.ts";

export function getClientKey(c: Context) {
  let clientKey: OauthClientKey | null;

  try {
    clientKey = OauthClientKeySchema.parse(c.req.param("clientkey"));
  } catch {
    clientKey = null;
  }

  return clientKey;
}

// Used for code exchange with PWA
export function getRandomCode() {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  // base64 is URLsafe https://github.com/chiefbiiko/std-encoding
  return new SHA256().update(buf).digest("base64").toString();
}

export function hash(str: string): string {
  // base64 is URLsafe https://github.com/chiefbiiko/std-encoding
  return new SHA256().update(str, "utf8").digest("base64").toString();
}
