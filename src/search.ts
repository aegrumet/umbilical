import { Context } from "../deps.ts";
import searchByTerm, { checkEnv } from "./piapi.ts";

const search = async (c: Context) => {
  try {
    checkEnv(c);
  } catch (_) {
    c.status(500);
    return c.text(
      "Search not available for this instance. Either it's not enabled or something else went wrong."
    );
  }

  const query: string | undefined = c.req.query("q");

  if (!query) {
    c.status(500);
    return c.text("No query provided.");
  }

  // deno-lint-ignore no-explicit-any
  const results: any = await searchByTerm(query, c);
  return c.json(results);
};

export default search;
