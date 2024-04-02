import { xml2js, parseFeed, Context } from "../../deps.ts";
import umbilicalUserAgent from "../config.ts";

const proxyRss = async (c: Context) => {
  const rss: string | undefined = c.req.query("rss");

  if (!rss) {
    c.status(500);
    return c.text("No rss provided.");
  }

  // deno-lint-ignore no-explicit-any
  let response: any = null;
  const options = {
    method: "GET",
    headers: {
      "User-Agent": umbilicalUserAgent,
    },
  };
  try {
    response = await fetch(rss, options);
  } catch (_) {
    c.status(500);
    return c.text("Error fetching feed.");
  }

  const xml: string = await response.text();

  // The feed parser bombs on invalid XML,
  // so first check for valid XML.
  try {
    const json = xml2js(xml, {
      compact: true,
    });
    if (!json.rss) {
      throw new Error("Invalid XML.");
    }
  } catch (_) {
    c.status(500);
    return c.text("Error parsing feed. Invalid XML.");
  }

  try {
    await parseFeed(xml);
  } catch (_) {
    c.status(500);
    return c.text("Error parsing feed. Invalid RSS.");
  }

  if (response.url && response.url !== rss) {
    c.header("X-Final-URL", response.url);
  }

  c.header("Content-Type", "application/rss+xml");
  return c.body(xml);
};

export default proxyRss;
