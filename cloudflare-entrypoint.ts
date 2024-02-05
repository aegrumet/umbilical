import { Context, Hono } from "./deps.ts";
import rest from "./rest-routes.ts";
import websocket from "./websocket-routes-cloudflare.ts";
import { Telemetry } from "./src/interfaces/telemetry.ts";
import { ConsoleTelemetry } from "./src/telemetry/console-telemetry.ts";

console.log("OpenTelemetry disabled, sending telemetry to console.");
const telemetry: Telemetry = new ConsoleTelemetry();

const app = new Hono();

app.use("*", async (c: Context, next) => {
  c.set("telemetry", telemetry);
  await next();
});

app.use("*", async (c: Context, next) => {
  const telemetry: Telemetry = c.get("telemetry");
  telemetry.incrementCounter("http.requests", "global", 1);
  await next();
});

app.route("/API/worker", rest);
app.route("/API/websocket", websocket);

export default app;
