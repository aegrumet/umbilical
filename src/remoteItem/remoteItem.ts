import { Context } from "../../deps.ts";
import { episodeByGuid, checkEnv } from "../lib/piapi.ts";
import { RemoteItem, RemoteItemsSchema } from "../interfaces/value.ts";

const remoteItemEpisodes = async (c: Context) => {
  try {
    checkEnv(c);
  } catch (_) {
    c.status(500);
    return c.text(
      "Search not available for this instance. Either it's not enabled or something else went wrong."
    );
  }

  const body: string | undefined = await c.req.json();

  if (!body) {
    c.status(500);
    return c.text("No query provided.");
  }

  if (!Array.isArray(body)) {
    c.status(500);
    return c.text("Invalid request.");
  }

  const parseResult = RemoteItemsSchema.safeParse(body);
  if (!parseResult.success || remoteItemEpisodes.length === 0) {
    c.status(500);
    return c.text("Invalid request.");
  }

  // deno-lint-ignore no-explicit-any
  const promises: Array<Promise<any>> = [];
  for (const item of parseResult.data as Array<RemoteItem>) {
    promises.push(episodeByGuid(item.itemGuid!, item.feedGuid, c));
  }

  const results = await Promise.all(promises);

  return c.json(results);
};

export default remoteItemEpisodes;
