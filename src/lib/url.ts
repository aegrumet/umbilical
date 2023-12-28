/***
 * Strip scheme and trailing slash from URL. Useful for matching podpings in
 * cases where there is variance in how the URL is presented.
 */
export function normalizedKeyFromUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}
