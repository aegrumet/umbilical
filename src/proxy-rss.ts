import { Request, Response, axios, Parser } from "../deps.ts";

const parser = new Parser();

const proxyRss = async (req: Request, res: Response) => {
  let feed = "";
  if ("rss" in req.query) {
    feed = req.query.rss as string;
  }

  if (feed.length === 0) {
    res.status(500);
    res.send("No rss provided.");
    return;
  }

  const options = {
    url: feed,
    method: "GET",
  };

  // deno-lint-ignore no-explicit-any
  let response: any = null;
  try {
    response = await axios(options);
  } catch (_) {
    res.status(500);
    res.send("Error fetching feed.");
    return;
  }

  // Only forward RSS XML, which we check by parsing
  // But we don't pass the parsed result, we pass the original.
  await parser
    .parseString(response.data)
    .then((_) => {
      res.send(response.data);
      return;
    })
    .catch(() => {
      res.status(500);
      res.send("Error fetching feed.");
      return;
    });
};

export default proxyRss;
