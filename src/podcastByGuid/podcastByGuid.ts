import { Context } from "../../deps.ts";
import { searchByGuid, checkEnv } from "../lib/piapi.ts";

export const podcastByGuidHandler = async (c: Context) => {
  try {
    checkEnv(c);
  } catch (_) {
    c.status(500);
    return c.text(
      "Podcast GUID lookup not available for this instance. Either it's not enabled or something else went wrong."
    );
  }

  const guid: string | undefined = c.req.query("guid");

  if (!guid) {
    c.status(500);
    return c.text("No guid provided.");
  }

  // deno-lint-ignore no-explicit-any
  const results: any = await searchByGuid(guid, c);
  return c.json(results);
};
