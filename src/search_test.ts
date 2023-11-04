import { assertEquals } from "../dev_deps.ts";
import search from "./search.ts";
import { Request, Response } from "../deps.ts";
import {
  createRequest,
  createResponse,
  MockRequest,
  MockResponse,
} from "../dev_deps.ts";
import { TEST_PI_API_KEY, TEST_PI_API_SECRET } from "../mocks/piapi.ts";

Deno.test("Fail on missing keys", () => {
  Deno.env.delete("PI_API_KEY");
  Deno.env.delete("PI_API_SECRET");
  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/search?q=batmanuniversity",
  });
  const response: MockResponse<Response> = createResponse();

  search(request, response);

  assertEquals(response._getStatusCode(), 500);
});

Deno.test("Fail on incorrect keys", () => {
  Deno.env.set("PI_API_KEY", `NOT${TEST_PI_API_KEY}`);
  Deno.env.set("PI_API_SECRET", `NOT${TEST_PI_API_SECRET}`);

  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/search?q=batmanuniversity",
  });
  const response: MockResponse<Response> = createResponse();

  search(request, response);

  assertEquals(response._getStatusCode(), 500);
});

Deno.test("Fails if no query is supplied", async () => {
  Deno.env.set("PI_API_KEY", TEST_PI_API_KEY);
  Deno.env.set("PI_API_SECRET", TEST_PI_API_SECRET);

  const request: MockRequest<Request> = createRequest({
    method: "GET",
    url: "/API/search",
  });
  const response: MockResponse<Response> = createResponse();

  await search(request, response);

  assertEquals(response._getStatusCode(), 500);
});

Deno.test(
  "Performs a request when the correct keys and a query are supplied",
  async () => {
    Deno.env.set("PI_API_KEY", TEST_PI_API_KEY);
    Deno.env.set("PI_API_SECRET", TEST_PI_API_SECRET);

    const request: MockRequest<Request> = createRequest({
      method: "GET",
      url: "/API/search?q=curry",
    });
    const response: MockResponse<Response> = createResponse();

    await search(request, response);

    assertEquals(response._getStatusCode(), 200);
  }
);
