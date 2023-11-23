import denoEnv from "./src/deno-env.ts";
import { Hono } from "./deps.ts";
import { loadGenericRoutes } from "./load-generic-routes.ts";
import { loadDenoRoutes } from "./load-deno-routes.ts";

const app = new Hono();
loadDenoRoutes(app);
loadGenericRoutes(app);

Deno.serve((r) => {
  return app.fetch(r, denoEnv());
});
