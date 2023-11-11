import {
  describe,
  it,
  afterAll,
  beforeAll,
  assertEquals,
  mf,
} from "../dev_deps.ts";
import app from "../app.ts";
import denoEnv from "./deno-env.ts";
import { installPiApiMock, uninstallPiApiMock } from "../mocks/piapi.ts";

const TEST_PI_API_KEY = "test pi api key";
const TEST_PI_API_SECRET = "test pi api secret";

Deno.env.set("UMBILICAL_KEYS", "DANGEROUSLY_ALLOW_ALL");

describe("Search", () => {
  beforeAll(() => {
    mf.install();
    installPiApiMock();
  });

  afterAll(() => {
    uninstallPiApiMock();
    mf.uninstall();
  });

  it("fails on missing keys", async () => {
    Deno.env.delete("PI_API_KEY");
    Deno.env.delete("PI_API_SECRET");

    const res = await app.request(
      "/API/search?q=batmanuniversity",
      undefined,
      denoEnv()
    );
    assertEquals(res.status, 500);
  });

  it("fails if no query is supplied", async () => {
    Deno.env.set("PI_API_KEY", TEST_PI_API_KEY);
    Deno.env.set("PI_API_SECRET", TEST_PI_API_SECRET);

    const res = await app.request("/API/search", undefined, denoEnv());
    assertEquals(res.status, 500);
  });

  it("fails on incorrect keys", async () => {
    Deno.env.set("PI_API_KEY", `NOT${TEST_PI_API_KEY}`);
    Deno.env.set("PI_API_SECRET", `NOT${TEST_PI_API_SECRET}`);

    const res = await app.request(
      "/API/search?q=batmanuniversity",
      undefined,
      denoEnv()
    );
    assertEquals(res.status, 500);
  });

  it("performs a request when the correct keys and a query are supplied", async () => {
    Deno.env.set("PI_API_KEY", TEST_PI_API_KEY);
    Deno.env.set("PI_API_SECRET", TEST_PI_API_SECRET);

    const res = await app.request(
      "/API/search?q=batmanuniversity",
      undefined,
      denoEnv()
    );
    assertEquals(res.status, 200);
  });
});
