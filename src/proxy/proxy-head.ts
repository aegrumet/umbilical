import { Context } from "../../deps.ts";
import umbilicalUserAgent from "../config.ts";

const proxyHead = async (c: Context) => {
  const headUrl: string | undefined = c.req.query("head");

  if (!headUrl) {
    c.status(500);
    return c.text("No link provided.");
  }

  // deno-lint-ignore no-explicit-any
  let response: any = null;
  const options = {
    method: "HEAD",
    headers: {
      "User-Agent": umbilicalUserAgent,
    },
  };
  try {
    response = await fetch(headUrl, options);
  } catch (_) {
    c.status(500);
    return c.text("Error fetching chapters.");
  }

  c.header("Content-Type", "text/plain");
  return c.body(response.url);
};

export default proxyHead;
