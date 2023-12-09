import denoEnv from "./src/deno-env.ts";
import { Hono } from "./deps.ts";
import websocket from "./websocket-routes.ts";
import rest from "./rest-routes.ts";
import { UmbilicalEnv } from "./src/umbilical-context.ts";

const app = new Hono();

app.route("/API", rest);
app.route("/ws-API", websocket);

const env: UmbilicalEnv = denoEnv();

Deno.serve((r) => {
  return app.fetch(r, env);
});

if (env.DEBUG) {
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
