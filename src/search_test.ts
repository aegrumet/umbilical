import { assertEquals, mf } from "../dev_deps.ts";
import app from "../app.ts";
import { TEST_PI_API_KEY, TEST_PI_API_SECRET } from "../mocks/piapi.ts";

Deno.env.set("UMBILICAL_KEYS", "DANGEROUSLY_ALLOW_ALL");
const PIAPI_PATH = "/api/1.0/search/byterm";

Deno.test("Fail on missing keys", async () => {
  Deno.env.delete("PI_API_KEY");
  Deno.env.delete("PI_API_SECRET");

  const res = await app.request("/API/search?q=batmanuniversity");
  assertEquals(res.status, 500);
});

Deno.test("Fail on incorrect keys", async () => {
  Deno.env.set("PI_API_KEY", `NOT${TEST_PI_API_KEY}`);
  Deno.env.set("PI_API_SECRET", `NOT${TEST_PI_API_SECRET}`);

  mf.install();
  mf.mock(`GET@${PIAPI_PATH}`, (_req, _) => {
    if (
      (Deno.env.get("PI_API_KEY") ?? "") !== TEST_PI_API_KEY ||
      (Deno.env.get("PI_API_SECRET") ?? "") !== TEST_PI_API_SECRET
    ) {
      return new Response("[]", {
        status: 500,
      });
    }
    return new Response("[]");
  });

  const res = await app.request("/API/search?q=batmanuniversity");
  assertEquals(res.status, 500);

  mf.uninstall();
});

Deno.test("Fails if no query is supplied", async () => {
  Deno.env.set("PI_API_KEY", TEST_PI_API_KEY);
  Deno.env.set("PI_API_SECRET", TEST_PI_API_SECRET);

  const res = await app.request("/API/search");
  assertEquals(res.status, 500);
});

Deno.test(
  "Performs a request when the correct keys and a query are supplied",
  async () => {
    Deno.env.set("PI_API_KEY", TEST_PI_API_KEY);
    Deno.env.set("PI_API_SECRET", TEST_PI_API_SECRET);

    mf.install();
    mf.mock(`GET@${PIAPI_PATH}`, (_req, _) => {
      return new Response("[]", {
        status: 200,
      });
    });
    const res = await app.request("/API/search?q=batmanuniversity");
    assertEquals(res.status, 200);
    mf.uninstall();
  }
);
