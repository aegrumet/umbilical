import { Request, Response, axios, Parser } from "../deps.ts";

const parser = new Parser();

const proxyRss = (req: Request, res: Response) => {
  let feed = "";
  if ("rss" in req.query) {
    feed = req.query.rss as string;
  }
  if (feed.length === 0) {
    res.send("error");
    return;
  }

  const options = {
    url: feed,
    method: "GET",
  };
  axios(options)
    .then((response) => {
      // Only forward RSS XML, which we check by parsing
      // But we don't pass the parsed result, we pass the original.
      parser
        .parseString(response.data)
        .then((_) => {
          res.set("Access-Control-Allow-Origin", "*");
          res.set("Access-Control-Allow-Methods", "GET");
          res.send(response.data);
        })
        .catch(() => {
          res.send("error");
        });
    })
    .catch((_) => {
      res.send("error");
    });
};

export default proxyRss;
