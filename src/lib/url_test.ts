import { describe, it, expect } from "../../dev_deps.ts";
import { normalizedKeyFromUrl } from "./url.ts";

// deno-lint-ignore no-explicit-any
const tests: any[] = [
  ["http url, no trailing slash", "http://example.com", "example.com"],
  ["https url, no trailing slash", "https://example.com", "example.com"],
  ["http url, trailing slash", "http://example.com/", "example.com"],
  ["https url, trailing slash", "https://example.com/", "example.com"],
  [
    "subdirectories, no trailing slash",
    "https://example.com/foo/bar/baz",
    "example.com/foo/bar/baz",
  ],
  [
    "subdirectories, trailing slash",
    "https://example.com/foo/bar/baz/",
    "example.com/foo/bar/baz",
  ],
  [
    "url args",
    "https://example.com/podcast.xml?foo=bar&baz=bork",
    "example.com/podcast.xml?foo=bar&baz=bork",
  ],
  [
    "url args and subdirectory",
    "https://example.com/podcast/?foo=bar&baz=bork",
    "example.com/podcast/?foo=bar&baz=bork",
  ],
  ["multiple trailing slashes", "https://example.com//", "example.com"],
];

describe("normalizedKeyFromUrl", () => {
  for (const [name, input, expected] of tests) {
    it(`should handle ${name}`, () => {
      const result = normalizedKeyFromUrl(input);
      expect(result).toEqual(expected);
    });
  }
});
