import { assertEquals } from "../dev_deps.ts";
import proxyChapters from "./proxy-chapters.ts";
import { Request, Response } from "../deps.ts";
import {
  createRequest,
  createResponse,
  MockRequest,
  MockResponse,
} from "../dev_deps.ts";

Deno.test("Fails if no chapters is supplied", async () => {
  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/proxy",
  });
  const response: MockResponse<Response> = createResponse();

  await proxyChapters(request, response);

  assertEquals(response._getStatusCode(), 500);
});

Deno.test("Fails if the chapters argument is not a valid URL", async () => {
  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/proxy?chapters=foo",
  });
  const response: MockResponse<Response> = createResponse();

  await proxyChapters(request, response);

  assertEquals(response._getStatusCode(), 500);
});

Deno.test("Passes when the URL returns a valid chapters file", async () => {
  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/proxy?chapters=http://examples.com/basechapters",
  });
  const response: MockResponse<Response> = createResponse();

  await proxyChapters(request, response);

  assertEquals(response._getStatusCode(), 200);
});

Deno.test("Fails when the URL returns an invalid chapters file", async () => {
  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/proxy?chapters=http://example.com/badchapters",
  });
  const response: MockResponse<Response> = createResponse();

  await proxyChapters(request, response);

  assertEquals(response._getStatusCode(), 500);
});

Deno.test("Fails when the URL isn't found", async () => {
  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/proxy?chapters=http://example.com/missingchapters",
  });
  const response: MockResponse<Response> = createResponse();

  await proxyChapters(request, response);

  assertEquals(response._getStatusCode(), 500);
});
