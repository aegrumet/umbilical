import {
  describe,
  it,
  afterAll,
  beforeAll,
  assertEquals,
  mf,
} from "../../dev_deps.ts";
import rest from "../../rest-routes.ts";
import { installFeedsMock, uninstallFeedsMock } from "../../mocks/fetch.ts";
import denoEnv from "../deno-env.ts";

Deno.env.set("UMBILICAL_KEYS", "DANGEROUSLY_ALLOW_ALL");

describe("Chapters Proxy", () => {
  beforeAll(() => {
    mf.install();
    installFeedsMock();
  });

  afterAll(() => {
    uninstallFeedsMock();
    mf.uninstall();
  });

  it("fails if no chapters is supplied", async () => {
    const res = await rest.request("/proxy", undefined, denoEnv());
    assertEquals(res.status, 500);
  });

  it("fails if the chapters argument is not a valid URL", async () => {
    const res = await rest.request("/proxy?chapters=foo", undefined, denoEnv());
    assertEquals(res.status, 500);
  });

  it("passes when the URL returns a valid chapters file", async () => {
    const res = await rest.request(
      "/proxy?chapters=http://example.com/basechapters",
      undefined,
      denoEnv()
    );
    assertEquals(res.status, 200);
  });

  it("fails when the URL returns an invalid chapters file", async () => {
    const res = await rest.request(
      "/proxy?rss=http://example.com/badchapters",
      undefined,
      denoEnv()
    );
    assertEquals(res.status, 500);
  });

  it("fails when the URL isn't found", async () => {
    const res = await rest.request(
      "/proxy?rss=http://example.com/missingchapters"
    );
    assertEquals(res.status, 500);
  });
});
