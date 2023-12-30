import { Hono, Context } from "../../deps.ts";

import search from "../search/search.ts";
import { authenticate, gateFeature } from "./middleware.ts";

const routes = new Hono();
routes.use("*", authenticate);
routes.use("*", gateFeature("search"));

routes.get("/", async (c: Context) => {
  return await search(c);
});

export default routes;
