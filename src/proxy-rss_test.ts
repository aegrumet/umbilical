import { assertEquals, mf } from "../dev_deps.ts";
import app from "../app.ts";
import { feeds } from "../mocks/axios.ts";

Deno.env.set("UMBILICAL_KEYS", "DANGEROUSLY_ALLOW_ALL");

Deno.test("Fails if no rss is supplied", async () => {
  const res = await app.request("/API/proxy");
  assertEquals(res.status, 500);
});

Deno.test("Fails if the rss argument is not a valid URL", async () => {
  const res = await app.request("/API/proxy?rss=foo");
  assertEquals(res.status, 500);
});

Deno.test("Fails when the URL returns an invalid RSS feed", async () => {
  mf.install();
  mf.mock("GET@/badfeed", (_req, _) => {
    return new Response(feeds.get("badfeed"), {
      status: 200,
    });
  });
  const res = await app.request("/API/proxy?rss=http://example.com/badfeed");
  assertEquals(res.status, 500);
  mf.uninstall();
});

Deno.test("Passes when the URL returns a valid RSS feed", async () => {
  mf.install();
  mf.mock("GET@/basefeed", (_req, _) => {
    return new Response(feeds.get("basefeed"), {
      status: 200,
    });
  });
  const res = await app.request("/API/proxy?rss=http://example.com/basefeed");
  assertEquals(res.status, 200);
  mf.uninstall();
});

Deno.test("Fails when the URL isn't found", async () => {
  mf.install();
  mf.mock("GET@/missingfeed", (_req, _) => {
    return new Response("notfound", {
      status: 404,
    });
  });
  const res = await app.request(
    "/API/proxy?rss=http://example.com/missingfeed"
  );
  assertEquals(res.status, 500);
  mf.uninstall();
});
