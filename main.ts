import { Request, Response, express } from "./deps.ts";

import proxyRss from "./src/proxy-rss.ts";
import search from "./src/search.ts";

const app = express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to the Dinosaur API!");
});

app.get("/API/proxy", (req, res) => {
  return proxyRss(req, res);
});

app.get("/API/search", (req, res) => {
  return search(req, res);
});

app.listen(8000);
