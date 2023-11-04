import { cors, express, Request, Response } from "./deps.ts";

import proxyRss from "./src/proxy-rss.ts";
import proxyChapters from "./src/proxy-chapters.ts";
import search from "./src/search.ts";
import verify from "./src/verify.ts";

const app = express();

app.use(cors());

app.get("/API/proxy", async (req: Request, res: Response) => {
  if (!verify(req)) {
    res.status(401);
    res.send("Unauthorized.");
    return;
  }
  if ("rss" in req.query) {
    return await proxyRss(req, res);
  }
  if ("chapters" in req.query) {
    return await proxyChapters(req, res);
  }

  res.status(500);
  res.send("No proxy type provided.");
});

app.get("/API/search", async (req: Request, res: Response) => {
  if (!verify(req)) {
    res.status(401);
    res.send("Unauthorized.");
    return;
  }
  return await search(req, res);
});

app.listen(8000);
