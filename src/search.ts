import { Request, Response, piapi } from "../deps.ts";

// deno-lint-ignore no-explicit-any
let pi: any = null;

const search = async (req: Request, res: Response) => {
  try {
    pi = piapi(Deno.env.get("PI_API_KEY"), Deno.env.get("PI_API_SECRET"));
  } catch (e) {
    console.error("Error configuring PI API", e);
  }

  if (!pi) {
    res.status(500);
    res.send(
      "Search not available for this instance. Either it's not enabled or something else went wrong."
    );
    return;
  }

  let query = "";
  if ("q" in req.query) {
    query = req.query.q as string;
  }

  if (!query.length) {
    res.status(500);
    res.send("No query provided.");
    return;
  }

  // deno-lint-ignore no-explicit-any
  const results: any = await pi.searchByTerm(query);
  res.send(results);
};

export default search;
