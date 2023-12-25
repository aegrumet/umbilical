import { Hono } from "./deps.ts";
import rest from "./rest-routes.ts";
import websocket from "./websocket-routes-cloudflare.ts";

const app = new Hono();

app.route("/API/worker", rest);
app.route("/API/websocket", websocket);

export default app;
