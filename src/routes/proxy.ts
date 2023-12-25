import { Hono, Context, cors } from "../../deps.ts";
import proxyRss from "../proxy/proxy-rss.ts";
import proxyChapters from "../proxy/proxy-chapters.ts";
import proxyOpml from "../proxy/proxy-opml.ts";

import verify from "../verify.ts";
import UmbilicalContext from "../interfaces/umbilical-context.ts";

const routes = new Hono();

routes.get("/", async (c: Context) => {
  if (!verify(c as UmbilicalContext)) {
    c.status(401);
    return c.text("Unauthorized.");
  }

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

  c.status(500);
  return c.text("No proxy type provided.");
});

export default routes;
