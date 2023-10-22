import { Request, Response, piapi } from "../deps.ts";

const pi = piapi(Deno.env.get("PI_API_KEY"), Deno.env.get("PI_API_SECRET"));

const search = (req: Request, res: Response) => {
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
