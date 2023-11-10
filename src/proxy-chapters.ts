import { Context } from "../deps.ts";

const proxyChapters = async (c: Context) => {
  const chapters: string | undefined = c.req.query("chapters");

  if (!chapters) {
    c.status(500);
    return c.text("No chapters link provided.");
  }

  // deno-lint-ignore no-explicit-any
  let response: any = null;
  try {
    response = await fetch(chapters);
  } catch (_) {
    c.status(500);
    return c.text("Error fetching chapters.");
  }

  // Baseline validation.
  // deno-lint-ignore no-explicit-any
  const json: any = await response.json();
  if (!("chapters" in json)) {
    c.status(500);
    return c.text("Error fetching chapters.");
  }

  c.header("Content-Type", "application/json+chapters");
  return c.body(response.data);
};

export default proxyChapters;
