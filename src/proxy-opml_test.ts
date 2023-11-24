import {
  describe,
  it,
  afterAll,
  beforeAll,
  assertEquals,
  mf,
} from "../dev_deps.ts";
import rest from "../rest-routes.ts";
import { installFeedsMock, uninstallFeedsMock } from "../mocks/fetch.ts";
import denoEnv from "./deno-env.ts";

Deno.env.set("UMBILICAL_KEYS", "DANGEROUSLY_ALLOW_ALL");

describe("OPML Proxy", () => {
  beforeAll(() => {
    mf.install();
    installFeedsMock();
  });

  afterAll(() => {
    uninstallFeedsMock();
    mf.uninstall();
  });

  it("fails if no opml is supplied", async () => {
    const res = await rest.request("/proxy?rss=notopml", undefined, denoEnv());
    assertEquals(res.status, 500);
  });

  it("fails if the opml argument is not a valid URL", async () => {
    const res = await rest.request("/proxy?opml=foo", undefined, denoEnv());
    assertEquals(res.status, 500);
  });

  it("fails when the URL returns an invalid OPML feed", async () => {
    const res = await rest.request(
      "/proxy?opml=http://example.com/badfeed",
      undefined,
      denoEnv()
    );
    assertEquals(res.status, 500);
  });

  it("passes when the URL returns a valid OPML feed", async () => {
    const res = await rest.request(
      "/proxy?opml=http://example.com/baseopml",
      undefined,
      denoEnv()
    );
    assertEquals(res.status, 200);
  });

  it("fails when the URL isn't found", async () => {
    const res = await rest.request(
      "/proxy?opml=http://example.com/missingfeed",
      undefined,
      denoEnv()
    );
    assertEquals(res.status, 500);
  });
});
