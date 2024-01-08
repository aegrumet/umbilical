import denoEnv from "./src/deno-env.ts";
import { Hono } from "./deps.ts";
import websocket from "./websocket-routes.ts";
import rest from "./rest-routes.ts";
import restServer from "./rest-routes-server.ts";
import { UmbilicalEnv } from "./src/interfaces/umbilical-context.ts";
import { umbilicalUserAgent } from "./src/config.ts";

const app = new Hono();

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
    `Podping throttle timeout: ${env.PODPING_TIMEOUT_MINUTES} minutes`
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
