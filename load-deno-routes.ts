import { Context, Hono } from "./deps.ts";
import relayPodping from "./src/relay-podping.ts";
import UmbilicalContext from "./src/umbilical-context.ts";
import verify from "./src/verify.ts";

export function loadDenoRoutes(app: Hono): void {
  // NB: This is a websocket endpoint, so it goes before the CORS middleware.
  app.get("/API/podping-ws", (c: Context) => {
    if (!verify(c as UmbilicalContext)) {
      c.status(401);
      return c.text("Unauthorized.");
    }
    return relayPodping(c);
  });
}
