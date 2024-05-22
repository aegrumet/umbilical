import { Hono, Context } from "../../deps.ts";
import proxyRss from "../proxy/proxy-rss.ts";
import proxyChapters from "../proxy/proxy-chapters.ts";
import proxyOpml from "../proxy/proxy-opml.ts";

import { authenticate, gateFeature } from "./middleware.ts";
import proxyHead from "../proxy/proxy-head.ts";

const routes = new Hono();
routes.use("*", authenticate);
routes.use("*", gateFeature("proxy"));

routes.get("/", async (c: Context) => {
  const rss: string | undefined = c.req.query("rss");
  if (rss) {
    return await proxyRss(c);
  }

  const chapters: string | undefined = c.req.query("chapters");
  if (chapters) {
    return await proxyChapters(c);
  }

  const opml: string | undefined = c.req.query("opml");
  if (opml) {
    return await proxyOpml(c);
  }

  const headUrl: string | undefined = c.req.query("head");
  if (headUrl) {
    return await proxyHead(c);
  }

  c.status(500);
  return c.text("No proxy type provided.");
});

export default routes;
