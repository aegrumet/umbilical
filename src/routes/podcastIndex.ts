import { Hono, Context } from "../../deps.ts";

import searchHandler from "../search/search.ts";
import { remoteItemEpisodeHandler } from "../remoteItem/remoteItem.ts";
import { podcastByGuidHandler } from "../podcastByGuid/podcastByGuid.ts";
import { podcastByFeedUrlHandler } from "../podcastByFeedUrl/podcastByFeedUrl.ts";
import { podrollHandler } from "../podroll/podroll.ts";

import { authenticate, gateFeature } from "./middleware.ts";

const routes = new Hono();
routes.use("*", authenticate);
routes.use("*", gateFeature("podcastindex"));

routes.get("/search/byterm", async (c: Context) => {
  return await searchHandler(c);
});

routes.get("/episodes/byguid", async (c: Context) => {
  return await remoteItemEpisodeHandler(c);
});

routes.get("/podcasts/byguid", async (c: Context) => {
  return await podcastByGuidHandler(c);
});

routes.get("/podcasts/byfeedurl", async (c: Context) => {
  return await podcastByFeedUrlHandler(c);
});

routes.get("/extras/podroll", async (c: Context) => {
  return await podrollHandler(c);
});

export default routes;
