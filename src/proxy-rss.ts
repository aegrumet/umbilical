import { parse, parseFeed, Context } from "../deps.ts";

const proxyRss = async (c: Context) => {
  const rss: string | undefined = c.req.query("rss");

  if (!rss) {
    c.status(500);
    return c.text("No rss provided.");
  }

  // deno-lint-ignore no-explicit-any
  let response: any = null;
  try {
    response = await fetch(rss);
  } catch (_) {
    c.status(500);
    return c.text("Error fetching feed.");
  }

  const xml: string = await response.text();

  // The feed parser bombs on invalid XML,
  // so first check for valid XML.
  try {
    parse(xml);
  } catch (_) {
    c.status(500);
    return c.text("Error parsing feed.");
  }

  try {
    await parseFeed(xml);
  } catch (_) {
    c.status(500);
    return c.text("Error parsing feed.");
  }

  c.header("Content-Type", "application/rss+xml");
  return c.body(xml);
};

export default proxyRss;
