import { Hono } from "./deps.ts";
import rest from "./rest-routes.ts";
import websocket from "./websocket-routes-cloudflare.ts";

const app = new Hono();

app.route("/API", rest);
app.route("/ws-API", websocket);

export default app;
