import { assertEquals } from "../dev_deps.ts";
import proxy from "./proxy-rss.ts";
import { Request, Response } from "../deps.ts";
import {
  createRequest,
  createResponse,
  MockRequest,
  MockResponse,
} from "../dev_deps.ts";

Deno.test("Fails if no rss is supplied", async () => {
  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/proxy",
  });
  const response: MockResponse<Response> = createResponse();

  await proxy(request, response);

  assertEquals(response._getStatusCode(), 500);
});

Deno.test("Fails if the rss argument is not a valid URL", async () => {
  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/proxy?rss=foo",
  });
  const response: MockResponse<Response> = createResponse();

  await proxy(request, response);

  assertEquals(response._getStatusCode(), 500);
});

Deno.test("Passes when the URL returns a valid RSS feed", async () => {
  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/proxy?rss=http://examples.com/basefeed",
  });
  const response: MockResponse<Response> = createResponse();

  await proxy(request, response);

  assertEquals(response._getStatusCode(), 200);
});

Deno.test("Fails when the URL returns an invalid RSS feed", async () => {
  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/proxy?rss=http://example.com/badfeed",
  });
  const response: MockResponse<Response> = createResponse();

  await proxy(request, response);

  assertEquals(response._getStatusCode(), 500);
});

Deno.test("Fails when the URL isn't found", async () => {
  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/proxy?rss=http://example.com/missingfeed",
  });
  const response: MockResponse<Response> = createResponse();

  await proxy(request, response);

  assertEquals(response._getStatusCode(), 500);
});
