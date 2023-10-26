import { express, Request, Response } from "./deps.ts";

import proxyRss from "./src/proxy-rss.ts";
import search from "./src/search.ts";
import verify from "./src/verify.ts";

const app = express();

app.get("/API/proxy", async (req: Request, res: Response) => {
  if (!verify(req)) {
    res.status(401);
    res.send("Unauthorized.");
    return;
  }
  return await proxyRss(req, res);
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
