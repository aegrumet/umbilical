import { Hono, Context } from "../../deps.ts";

import search from "../search/search.ts";
import verify from "../verify.ts";
import UmbilicalContext from "../interfaces/umbilical-context.ts";

const routes = new Hono();

routes.get("/", async (c: Context) => {
  if (!verify(c as UmbilicalContext)) {
    c.status(401);
    return c.text("Unauthorized.");
  }
  return await search(c);
});

export default routes;
