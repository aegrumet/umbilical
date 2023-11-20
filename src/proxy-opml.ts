import { xml2js, parseFeed, Context } from "../deps.ts";
import umbilicalUserAgent from "./config.ts";

const proxyOpml = async (c: Context) => {
  const opml: string | undefined = c.req.query("opml");

  if (!opml) {
    c.status(500);
    return c.text("No opml provided.");
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
    response = await fetch(opml, options);
  } catch (_) {
    c.status(500);
    return c.text("Error fetching feed.");
  }

  const xml: string = await response.text();

  // deno-lint-ignore no-explicit-any
  let json: any;

  try {
    json = xml2js(xml, {
      compact: true,
    });
    if (!validOpmlJson(json)) {
      throw new Error("Invalid XML.");
    }
  } catch (_) {
    c.status(500);
    return c.text("Error parsing feed. Invalid OPML.");
  }

  c.header("Content-Type", "application/xml");
  return c.body(xml);
};

/***
 * Perform a few quick checks to make sure this looks like OPML
 * Use already-parsed json.
 */
// deno-lint-ignore no-explicit-any
const validOpmlJson = (json: any): boolean => {
  if (!json.opml) {
    return false;
  }

  if (!json.opml.head) {
    return false;
  }

  if (!json.opml.body) {
    return false;
  }

  if (!json.opml.body.outline) {
    return false;
  }

  return true;
};

export default proxyOpml;
