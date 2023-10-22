import { Request, Response, piapi } from "../deps.ts";

// deno-lint-ignore no-explicit-any
let pi: any = null;

try {
  pi = piapi(Deno.env.get("PI_API_KEY"), Deno.env.get("PI_API_SECRET"));
} catch (e) {
  console.error("Error configuring PI API", e);
}

const search = (req: Request, res: Response) => {
  if (!pi) {
    res.status(500);
    res.send(
      "Search not available for this instance. Either it's not enabled or something else went wrong."
    );
    return;
  }
  let query = "batmanuniversity";
  if ("q" in req.query) {
    query = req.query.q as string;
  }
  // deno-lint-ignore no-explicit-any
  pi.searchByTerm(query).then((results: any) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");
    res.send(results);
  });
};

export default search;
