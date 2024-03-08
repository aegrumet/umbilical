import { xml2js, Context } from "../../deps.ts";
import umbilicalUserAgent from "../config.ts";
import { podcastByGuid } from "./piapi.ts";
import {
  RssFeedInfo,
  RssFeedInfoSchema,
  RssLink,
  RssLinkWithRel,
} from "../interfaces/rss.ts";
import { FeedForOpml, FeedForOpmlSchema } from "../interfaces/opml.ts";
import { z } from "../../deps.ts";

export async function feedInfoFromFeedGuid(
  feedGuid: string,
  c: Context
): Promise<FeedForOpml | null> {
  const promise = podcastByGuid(feedGuid, c);
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

  // deno-lint-ignore no-explicit-any
  let parseResult: any;
  let success = false;

  try {
    parseResult = RssFeedInfoSchema.parse(json as RssFeedInfo);
    success = true;
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log(err.issues);
    }
  }

  if (!success) {
    return null;
  }

  let link = "";
  if (parseResult.rss.channel.link !== undefined) {
    if (Array.isArray(parseResult.rss.channel.link)) {
      const arr = parseResult.rss.channel.link as unknown as Array<
        RssLinkWithRel | RssLink
      >;
      for (let i = 0; i < arr.length; i++) {
        if ("_text" in arr[i]) {
          link = (arr[i] as RssLink)._text;
          break;
        }
      }
    } else {
      link = parseResult.rss.channel.link._text;
    }
  }

  return {
    feed: {
      url: feedUrl,
      title: parseResult.rss.channel.title._text,
      link,
      description: parseResult.rss.channel.description!._text ?? "",
      image: parseResult.rss.channel.image!.url._text ?? "",
    },
  };
}
