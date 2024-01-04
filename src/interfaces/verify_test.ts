import { describe, it, assertEquals } from "../../dev_deps.ts";
import verifyFromHttpRequest from "../verify.ts";
import { hmac } from "../../deps.ts";
import { UmbilicalContext } from "./umbilical-context.ts";

function generateSignatureHeader(url: string, key: string): string {
  const timestamp = Date.now();
  const urlObject = new URL(url);
  const timestampedPayload = `${timestamp}.${url.slice(
    urlObject.protocol.length + 2
  )}.`;
  const expectedSignature = hmac(
    "sha256",
    key,
    timestampedPayload,
    "utf8",
    "hex"
  );

  return `t=${timestamp},s=${expectedSignature}`;
}

const url = "https://example.com/API/proxy?rss=http://example.com/basefeed";
const UMBILICAL_KEY_1 = "G98S6lOSmNJdZ1JL7HTgmRiPDXiWin88";
const UMBILICAL_KEY_2 = "MmyVKjEKEpScM1688mgEae120cS5NADY";

// deno-lint-ignore no-explicit-any
const baseCasePassTestCase: any = {
  label: "Base case passing test",
  UMBILICAL_KEYS: UMBILICAL_KEY_1,
  request: {
    method: "GET",
    url,
    headers: {
      "X-Umbilical-Signature": generateSignatureHeader(url, UMBILICAL_KEY_1),
    },
  },
  expected: true,
};

// deno-lint-ignore no-explicit-any
const tests: Array<any> = [
  { ...baseCasePassTestCase },
  {
    ...baseCasePassTestCase,
    label: "Signature has no comma",
    request: {
      ...baseCasePassTestCase.request,
      headers: { "X-Umbilical-Signature": "no comma" },
    },
    expected: false,
  },
  {
    ...baseCasePassTestCase,
    label: "Signature has no t equals",
    request: {
      ...baseCasePassTestCase.request,
      headers: { "X-Umbilical-Signature": "t1234567890,s=abcdefghijk" },
    },
    expected: false,
  },
  {
    ...baseCasePassTestCase,
    label: "Signature has no s equals",
    request: {
      ...baseCasePassTestCase.request,
      headers: { "X-Umbilical-Signature": "t=1234567890,sabcdefghijk" },
    },
    expected: false,
  },
  {
    ...baseCasePassTestCase,
    label: "Signature has a bad timestamp",
    request: {
      ...baseCasePassTestCase.request,
      headers: { "X-Umbilical-Signature": "t=notatimestamp,sabcdefghijk" },
    },
    expected: false,
  },
  {
    ...baseCasePassTestCase,
    label: "Signature has an expired timestamp",
    request: {
      ...baseCasePassTestCase.request,
      headers: { "X-Umbilical-Signature": "t=0,sabcdefghijk" },
    },
    expected: false,
  },
  {
    ...baseCasePassTestCase,
    label: "Signature has a future timestamp",
    request: {
      ...baseCasePassTestCase.request,
      headers: {
        "X-Umbilical-Signature": "t=${Date.now() + 5000},sabcdefghijk",
      },
    },
    expected: false,
  },
  {
    ...baseCasePassTestCase,
    label: "UMBILICAL_KEYS is not set",
    UMBILICAL_KEYS: undefined,
    expected: false,
  },
  {
    ...baseCasePassTestCase,
    label: "DANGEROUSLY_ALLOW_ALL is set, and signature is bad",
    request: {
      ...baseCasePassTestCase.request,
      headers: { "X-Umbilical-Signature": "t=notatimestamp,sabcdefghijk" },
    },
    UMBILICAL_KEYS: "DANGEROUSLY_ALLOW_ALL",
    expected: true,
  },
  {
    ...baseCasePassTestCase,
    label: "DANGEROUSLY_ALLOW_ALL is the second key, and signature is bad",
    request: {
      ...baseCasePassTestCase.request,
      headers: { "X-Umbilical-Signature": "t=notatimestamp,sabcdefghijk" },
    },
    UMBILICAL_KEYS: `${UMBILICAL_KEY_1},DANGEROUSLY_ALLOW_ALL`,
    expected: true,
  },
  {
    ...baseCasePassTestCase,
    label: "Signature matches second key",
    request: {
      ...baseCasePassTestCase.request,
      headers: {
        "X-Umbilical-Signature": generateSignatureHeader(url, UMBILICAL_KEY_2),
      },
    },
    UMBILICAL_KEYS: `${UMBILICAL_KEY_1},${UMBILICAL_KEY_2}`,
    expected: true,
  },
];

describe("Verification", () => {
  tests.forEach((test) => {
    it(test.label, () => {
      if (test["UMBILICAL_KEYS"] === null) {
        Deno.env.delete("UMBILICAL_KEYS");
      } else {
        Deno.env.set("UMBILICAL_KEYS", test["UMBILICAL_KEYS"]);
      }

      const c = {
        req: {
          url: test.request.url,
          header: (key: string) => {
            return test.request.headers[key];
          },
        },
        env: {
          UMBILICAL_KEYS: test["UMBILICAL_KEYS"],
        },
      } as UmbilicalContext;

      assertEquals(verifyFromHttpRequest(c), test.expected);
    });
  });
});
