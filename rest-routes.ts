import { Hono, Context, cors } from "./deps.ts";
import proxyRss from "./src/proxy/proxy-rss.ts";
import proxyChapters from "./src/proxy/proxy-chapters.ts";
import proxyOpml from "./src/proxy/proxy-opml.ts";

import search from "./src/search.ts";
import verify from "./src/verify.ts";
import UmbilicalContext from "./src/interfaces/umbilical-context.ts";

const rest = new Hono();

rest.use("/*", cors());

rest.get("/proxy", async (c: Context) => {
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

rest.get("/search", async (c: Context) => {
  if (!verify(c as UmbilicalContext)) {
    c.status(401);
    return c.text("Unauthorized.");
  }
  return await search(c);
});

export default rest;
