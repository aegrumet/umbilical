import { Context } from "../../deps.ts";
import { searchByFeedUrl, checkEnv } from "../lib/piapi.ts";

export const podcastByFeedUrlHandler = async (c: Context) => {
  try {
    checkEnv(c);
  } catch (_) {
    c.status(500);
    return c.text(
      "Podcast GUID lookup not available for this instance. Either it's not enabled or something else went wrong."
    );
  }

  const feedUrl: string | undefined = c.req.query("feedUrl");

  if (!feedUrl) {
    c.status(500);
    return c.text("No feedUrl provided.");
  }

  // deno-lint-ignore no-explicit-any
  const results: any = await searchByFeedUrl(feedUrl, c);
  return c.json(results);
};
