import { assertEquals, mf } from "../dev_deps.ts";
import app from "../app.ts";
import { feeds } from "../mocks/axios.ts";

Deno.env.set("UMBILICAL_KEYS", "DANGEROUSLY_ALLOW_ALL");

Deno.test("Fails if no chapters is supplied", async () => {
  const res = await app.request("/API/proxy");
  assertEquals(res.status, 500);
});

Deno.test("Fails if the chapters argument is not a valid URL", async () => {
  const res = await app.request("/API/proxy?chapters=foo");
  assertEquals(res.status, 500);
});

Deno.test("Passes when the URL returns a valid chapters file", async () => {
  mf.install();
  mf.mock("GET@/basechapters", (_req, _) => {
    return new Response(JSON.stringify(feeds.get("basechapters")), {
      status: 200,
    });
  });
  const res = await app.request(
    "/API/proxy?chapters=http://example.com/basechapters"
  );
  assertEquals(res.status, 200);
  mf.uninstall();
});

Deno.test("Fails when the URL returns an invalid chapters file", async () => {
  mf.install();
  mf.mock("GET@/badchapters", (_req, _) => {
    return new Response(feeds.get("badchapters"), {
      status: 200,
    });
  });
  const res = await app.request(
    "/API/proxy?rss=http://example.com/badchapters"
  );
  assertEquals(res.status, 500);
  mf.uninstall();
});

Deno.test("Fails when the URL isn't found", async () => {
  mf.install();
  mf.mock("GET@/missingchapters", (_req, _) => {
    return new Response("notfound", {
      status: 404,
    });
  });
  const res = await app.request(
    "/API/proxy?rss=http://example.com/missingchapters"
  );
  assertEquals(res.status, 500);
  mf.uninstall();
});
