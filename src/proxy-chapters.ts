import { Request, Response, axios } from "../deps.ts";

const proxyChapters = async (req: Request, res: Response) => {
  let chaptersUrl = "";
  if ("chapters" in req.query) {
    chaptersUrl = req.query.chapters as string;
  }

  if (chaptersUrl.length === 0) {
    res.status(500);
    res.send("No rss provided.");
    return;
  }

  const options = {
    url: chaptersUrl,
    method: "GET",
  };

  // deno-lint-ignore no-explicit-any
  let response: any = null;
  try {
    response = await axios(options);
  } catch (e) {
    console.log(chaptersUrl, e);
    res.status(500);
    res.send("Error fetching chapters.");
    return;
  }

  // Baseline validation.
  if (!("chapters" in response.data)) {
    res.status(500);
    res.send("Error fetching chapters.");
    return;
  }

  res.set("Content-Type", "application/json+chapters");
  res.send(response.data);
};

export default proxyChapters;
