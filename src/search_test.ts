import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import search from "./search.ts";
import { Request, Response } from "../deps.ts";
import {
  createRequest,
  createResponse,
  MockRequest,
  MockResponse,
} from "npm:node-mocks-http@1.13.0";
import { TEST_PI_API_KEY, TEST_PI_API_SECRET } from "../mocks/piapi.ts";

Deno.test("search test", () => {
  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/search?q=batmanuniversity",
  });
  const response: MockResponse<Response> = createResponse();

  search(request, response);

  assertEquals(response._getStatusCode(), 500);
});

Deno.test("search test 2", async () => {
  Deno.env.set("PI_API_KEY", TEST_PI_API_KEY);
  Deno.env.set("PI_API_SECRET", TEST_PI_API_SECRET);

  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/search?q=curry",
  });
  const response: MockResponse<Response> = createResponse();

  await search(request, response);

  assertEquals(response._getStatusCode(), 200);
});
