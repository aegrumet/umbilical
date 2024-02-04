import denoEnv from "./src/deno-env.ts";
import { Context, Hono } from "./deps.ts";
import websocket from "./websocket-routes.ts";
import rest from "./rest-routes.ts";
import restServer from "./rest-routes-server.ts";
import { UmbilicalEnv } from "./src/interfaces/umbilical-context.ts";
import { umbilicalUserAgent } from "./src/config.ts";
import { Telemetry } from "./src/interfaces/telemetry.ts";
import { ConsoleTelemetry } from "./src/telemetry/console.ts";
import { OpenTelemetry } from "./src/telemetry/open-telemetry.ts";

const app = new Hono();

const consoleTelemetry = new OpenTelemetry();

app.use("*", async (c: Context, next) => {
  const telemetry: Telemetry = consoleTelemetry;
  c.set("telemetry", telemetry);
  await next();
});

app.use("*", async (c: Context, next) => {
  const telemetry: Telemetry = c.get("telemetry");
  telemetry.incrementCounter("http_requests", 1);
  await next();
});

app.route("/API/worker", rest);
app.route("/API/server", restServer);
app.route("/API/websocket", websocket);

const env: UmbilicalEnv = denoEnv();

Deno.serve((r) => {
  return app.fetch(r, env);
});

if (env.DEBUG) {
  console.log(`Umbilical User-Agent: ${umbilicalUserAgent}`);
  console.log(
    `Podping throttle timeout: ${env.WEBPUSH_THROTTLE_MINUTES} minutes`
  );
  // Log the run duration for this process.
  const startTime = new Date();
  setInterval(() => {
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log(
      `Process lifetime: ${Math.round(duration / (60 * 1000))} minutes.`
    );
  }, 60 * 1000);
}
