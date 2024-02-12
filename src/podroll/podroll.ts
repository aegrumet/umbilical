import { xml2js, js2xml, Context } from "../../deps.ts";
import umbilicalUserAgent from "../config.ts";
import { checkEnv } from "../lib/piapi.ts";
import { RssWithPodroll, RssWithPodrollSchema } from "../interfaces/rss.ts";
import { FeedForOpml } from "../interfaces/opml.ts";
import { feedInfoFromFeedGuid, feedInfoFromFeedUrl } from "../lib/podroll.ts";

const podroll = async (c: Context) => {
  try {
    checkEnv(c);
  } catch (_) {
    c.status(500);
    return c.text(
      "Podroll not available for this instance. Either it's not enabled or something else went wrong."
    );
  }

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
  //const xml = feedWithMixedRemoteItems;

  let json: Record<string, unknown> | undefined = undefined;

  try {
    json = xml2js(xml, {
      compact: true,
    });
    if (!json.rss) {
      throw new Error("Invalid XML.");
    }
  } catch (_) {
    c.status(500);
    return c.text("Error parsing feed. Invalid XML.");
  }

  const parseResult = RssWithPodrollSchema.safeParse(json as RssWithPodroll);

  if (!parseResult.success) {
    c.status(500);
    return c.text("Error parsing feed. No podroll or invalid podroll.");
  }

  const remoteItems =
    parseResult.data.rss.channel["podcast:podroll"]["podcast:remoteItem"];

  const lookups: Array<FeedForOpml> = [];
  const promises: Array<Promise<FeedForOpml | null>> = [];

  for (const remoteItem of remoteItems) {
    if (remoteItem._attributes.feedGuid) {
      const promise = feedInfoFromFeedGuid(remoteItem._attributes.feedGuid, c);
      promises.push(promise);
    } else if (remoteItem._attributes.feedUrl) {
      const promise = feedInfoFromFeedUrl(remoteItem._attributes.feedUrl);
      promises.push(promise);
    }
  }

  const results = await Promise.all(promises);

  results
    .filter((result) => result !== null)
    .map((result) => {
      lookups.push(result as FeedForOpml);
    });

  const opmlData = {
    opml: {
      _attributes: {
        version: "2.0",
      },
      head: {
        title: "My Podcast Subscriptions",
      },
      body: {
        outline: lookups.map((show: FeedForOpml) => {
          return {
            _attributes: {
              type: "rss",
              text: show.feed.title,
              title: show.feed.title,
              xmlUrl: show.feed.url,
              htmlUrl: show.feed.link,
            },
          };
        }),
      },
    },
  };

  const opml = js2xml(opmlData, { compact: true });
  const opmlXml = `<?xml version="1.0"?>${opml}`;

  c.header("Content-Type", "application/xml");
  return c.text(opmlXml);
};

export default podroll;
