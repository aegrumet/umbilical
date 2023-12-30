import { Hono, Context } from "../../deps.ts";

import podroll from "../podroll/podroll.ts";
import { authenticate, gateFeature } from "./middleware.ts";

const routes = new Hono();
routes.use("*", authenticate);
routes.use("*", gateFeature("podroll"));

routes.get("/", async (c: Context) => {
  return await podroll(c);
});

export default routes;
