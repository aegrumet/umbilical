import { hmac } from "../deps.ts";
import UmbilicalContext from "./interfaces/umbilical-context.ts";

/***
 * Verification for incoming requests.
 *
 * UMBILICAL_KEYS should be set in the server environment to a comma-separated
 * list of signing keys that are allowed to access the instance.
 *
 * If at least one of the keys is "DANGEROUSLY_ALLOW_ALL", then all requests
 * will be accepted.
 *
 * If none of the keys are "DANGERIOUSLY_ALLOW_ALL", each key will be tested
 * until one matches.
 *
 * If no keys match and "DANGEROUSLY_ALLOW_ALL" is not present, all requests
 * will be rejected.
 *
 * If UMBILICAL_KEYS is not set in the environment, all requests will be
 * rejected.
 *
 * Signing keys are used by Umbilical to verify the request signature, which is
 * passed differently depending on the request type:
 *
 *   - HTTP: the signature is passed in the "X-Umbilical-Signature" request
 *     header.
 *   - WebSocket: the signature is passed as the query string.
 *
 * The request signature has following format:
 *
 *     t=<timestamp in milliseconds>,s=<hmac>
 *
 * The hmac is generated by concatenating the timestamp, a requestLine string
 * (defined below), and body payload with periods, then generating an HMAC
 * SHA256 using a signing key as the secret:
 *
 *     s=<hmac-sha256(`${timestamp}.${requestLine}.${bodyText}`)>
 *
 * The requestLine is the request URL without the protocol ( https:// or
 * wss://), and including the query string for http(s) only.
 *
 * For GET requests the body payload is empty.
 *
 * Timestamps must be with 30 seconds of the current time.
 *
 * Entrypoint summary:
 *
 *  - verifyFromHttpRequest: verifies an HTTP request using the
 *    X-Umbilical-Signature header.
 *
 *  - verifyFromWebsocketRequest: verifies a WebSocket request using the query
 */

const verifyFromHttpRequest = (c: UmbilicalContext, body = ""): boolean => {
  const key: string | undefined = c.env.UMBILICAL_KEYS;
  if (key === undefined) return false;

  const keys: string[] = key.split(",");
  if (keys.includes("DANGEROUSLY_ALLOW_ALL")) return true;

  const header: string | undefined = c.req.header("X-Umbilical-Signature");
  if (header === undefined) return false;

  const url: URL = new URL(c.req.url);
  return verify(keys, header, c.req.url.slice(url.protocol.length + 2), body);
};

const verifyFromWebsocketRequest = (c: UmbilicalContext): boolean => {
  const key: string | undefined = c.env.UMBILICAL_KEYS;
  if (key === undefined) return false;

  const keys: string[] = key.split(",");
  if (keys.includes("DANGEROUSLY_ALLOW_ALL")) return true;

  const url: URL = new URL(c.req.url);
  if (url.search.length === 0) return false;

  const header: string = url.search.slice(1);

  return verify(
    keys,
    header,
    c.req.url.slice(url.protocol.length + 2, -url.search.length)
  );
};

const verify = (
  keys: string[],
  header: string,
  url: string,
  body = ""
): boolean => {
  const [t, s] = header.split(",");
  if (t === undefined || s === undefined) return false;

  const timestamp = t.split("=")[1];
  const signature = s.split("=")[1];

  if (timestamp === undefined || signature === undefined) return false;

  const timestampMilliseconds = parseInt(timestamp);
  if (isNaN(timestampMilliseconds)) return false;

  if (
    timestampMilliseconds >
    Date.now() + VERIFY_ACCEPTABLE_FUTURE_SECONDS * 1000
  )
    return false;
  if (timestampMilliseconds + VERIFY_TIMEOUT_SECONDS * 1000 < Date.now())
    return false;

  const timestampedPayload = `${timestamp}.${url}.${body}`;

  if (verifySignature(signature, keys, timestampedPayload)) return true;

  return false;
};

const verifySignature = (
  signature: string,
  keys: string[],
  payload: string
): boolean => {
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const expectedSignature = hmac("sha256", key, payload, "utf8", "hex");
    if (signature === expectedSignature) return true;
  }
  return false;
};

export const VERIFY_TIMEOUT_SECONDS = 30;

// Clients may be ahead of servers by this much.
export const VERIFY_ACCEPTABLE_FUTURE_SECONDS = 2;

export default verifyFromHttpRequest;
export { verifyFromWebsocketRequest };
