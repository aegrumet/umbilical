import { express } from "./deps.ts";

import proxyRss from "./src/proxy-rss.ts";
import search from "./src/search.ts";

const app = express();

app.get("/API/proxy", async (req, res) => {
  return await proxyRss(req, res);
});

app.get("/API/search", async (req, res) => {
  return await search(req, res);
});

app.listen(8000);
