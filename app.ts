import { Hono, cors, Context } from "./deps.ts";

import proxyRss from "./src/proxy-rss.ts";
import proxyChapters from "./src/proxy-chapters.ts";
import search from "./src/search.ts";
import verify from "./src/verify.ts";
import UmbilicalContext from "./src/umbilical-context.ts";

const app = new Hono();

app.use("/API/*", cors());

app.get("/API/proxy", async (c: Context) => {
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

  c.status(500);
  return c.text("No proxy type provided.");
});

app.get("/API/search", async (c: Context) => {
  if (!verify(c as UmbilicalContext)) {
    c.status(401);
    return c.text("Unauthorized.");
  }
  return await search(c);
});

export default app;