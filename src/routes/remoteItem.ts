import { Hono, Context } from "../../deps.ts";

import remoteItemEpisodesHandler, {
  remoteItemEpisodeHandler,
} from "../remoteItem/remoteItem.ts";
import { authenticate, gateFeature } from "./middleware.ts";

const routes = new Hono();
routes.use("*", authenticate);
routes.use("*", gateFeature("remoteItem"));

routes.get("/episode", async (c: Context) => {
  return await remoteItemEpisodeHandler(c);
});

routes.post("/episodes", async (c: Context) => {
  return await remoteItemEpisodesHandler(c);
});

export default routes;
