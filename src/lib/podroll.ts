import { xml2js, Context } from "../../deps.ts";
import umbilicalUserAgent from "../config.ts";
import { searchByGuid } from "./piapi.ts";
import { RssFeedInfo, RssFeedInfoSchema } from "../interfaces/rss.ts";
import { FeedForOpml, FeedForOpmlSchema } from "../interfaces/opml.ts";

export async function feedInfoFromFeedGuid(
  feedGuid: string,
  c: Context
): Promise<FeedForOpml | null> {
  const promise = searchByGuid(feedGuid, c);
  promise.catch((e) => {
    console.log(e);
  });
  const response = await promise;
  const parseResult = FeedForOpmlSchema.safeParse(response);

  if (!parseResult.success) {
    return null;
  }

  return parseResult.data;
}

export async function feedInfoFromFeedUrl(
  feedUrl: string
): Promise<FeedForOpml | null> {
  let fetchError = false;

  const promise = fetch(feedUrl, {
    method: "GET",
    headers: {
      "User-Agent": umbilicalUserAgent,
    },
  });
  promise.catch((e) => {
    console.log(e);
    fetchError = true;
  });

  if (fetchError) {
    return null;
  }
  const response = await promise;
  const xml: string = await response.text();

  let json: Record<string, unknown> | undefined = undefined;

  try {
    json = xml2js(xml, {
      compact: true,
    });
    if (!json.rss) {
      throw new Error("Invalid XML.");
    }
  } catch (_) {
    return null;
  }

  const parseResult = RssFeedInfoSchema.safeParse(json as RssFeedInfo);

  if (!parseResult.success) {
    return null;
  }

  return {
    feed: {
      url: feedUrl,
      title: parseResult.data.rss.channel.title._text,
      link: parseResult.data.rss.channel.link!._text ?? "",
      description: parseResult.data.rss.channel.description!._text ?? "",
      image: parseResult.data.rss.channel.image!.url._text ?? "",
    },
  };
}
