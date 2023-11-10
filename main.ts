import app from "./app.ts";
import denoEnv from "./src/deno-env.ts";

Deno.serve((r) => {
  return app.fetch(r, denoEnv());
});
