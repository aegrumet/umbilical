import denoEnv from "./src/deno-env.ts";
import { Hono } from "./deps.ts";
import websocket from "./websocket-routes.ts";
import rest from "./rest-routes.ts";

const app = new Hono();

app.route("/API", rest);
app.route("/ws-API", websocket);

Deno.serve((r) => {
  return app.fetch(r, denoEnv());
});
