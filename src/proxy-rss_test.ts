import {
  describe,
  it,
  afterAll,
  beforeAll,
  assertEquals,
  mf,
} from "../dev_deps.ts";
import app from "../app.ts";
import { installFeedsMock, uninstallFeedsMock } from "../mocks/fetch.ts";
import denoEnv from "./deno-env.ts";

Deno.env.set("UMBILICAL_KEYS", "DANGEROUSLY_ALLOW_ALL");

describe("RSS Proxy", () => {
  beforeAll(() => {
    mf.install();
    installFeedsMock();
  });

  afterAll(() => {
    uninstallFeedsMock();
    mf.uninstall();
  });

  it("fails if no rss is supplied", async () => {
    const res = await app.request("/API/proxy", undefined, denoEnv());
    assertEquals(res.status, 500);
  });

  it("fails if the rss argument is not a valid URL", async () => {
    const res = await app.request("/API/proxy?rss=foo", undefined, denoEnv());
    assertEquals(res.status, 500);
  });

  it("fails when the URL returns an invalid RSS feed", async () => {
    const res = await app.request(
      "/API/proxy?rss=http://example.com/badfeed",
      undefined,
      denoEnv()
    );
    assertEquals(res.status, 500);
  });

  it("passes when the URL returns a valid RSS feed", async () => {
    const res = await app.request(
      "/API/proxy?rss=http://example.com/basefeed",
      undefined,
      denoEnv()
    );
    assertEquals(res.status, 200);
  });

  it("fails when the URL isn't found", async () => {
    const res = await app.request(
      "/API/proxy?rss=http://example.com/missingfeed",
      undefined,
      denoEnv()
    );
    assertEquals(res.status, 500);
  });
});
