import { Hono, Context } from "../../deps.ts";

import remoteItemEpisodes, {
  remoteItemEpisode,
} from "../remoteItem/remoteItem.ts";
import { authenticate, gateFeature } from "./middleware.ts";

const routes = new Hono();
routes.use("*", authenticate);
routes.use("*", gateFeature("remoteItem"));

routes.get("/episode", async (c: Context) => {
  return await remoteItemEpisode(c);
});

routes.post("/episodes", async (c: Context) => {
  return await remoteItemEpisodes(c);
});

export default routes;
