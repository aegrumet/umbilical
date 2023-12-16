import { hmac } from "../deps.ts";
import UmbilicalContext from "./umbilical-context.ts";

/***
 * Verifies the incoming request.
 *
 * UMBILICAL_KEYS should be set in the server environment to a comma-separated
 * list of keys that are allowed to access the instance.
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
 * Keys are used to verify the "X-Umbilical-Signature" request header, which has the
 * following format:
 *
 *     t=<timestamp in milliseconds>,s=<hmac sha256 signature>
 *
 * The signature is generated by concatenating the timestamp and the request URL
 * (including query string) with a period, then generating an HMAC SHA256
 * signature using the key as the secret.
 *
 * Timestamps must be with 30 seconds of the current time.
 *
 * @returns {boolean} Whether the request is valid.
 */
const verify = (c: UmbilicalContext): boolean => {
  const key: string | undefined = c.env.UMBILICAL_KEYS;

  if (key === undefined) return false;

  const keys: string[] = key.split(",");
  if (keys.includes("DANGEROUSLY_ALLOW_ALL")) return true;

  const header: string | undefined = c.req.header("X-Umbilical-Signature");
  if (header === undefined) return false;

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

  const timestampedPayload = `${timestamp}.${c.req.url}`;
  if (verifySignature(signature, keys, timestampedPayload)) return true;

  // Some hosting services terminate SSL at the load balancer and forward a http
  // url to the server. If we get here and the url starts with http, check the
  // https version of the url as well.
  if (c.req.url.startsWith("http://")) {
    const fixedUrl = c.req.url.replace(/^http/, "https");
    const fixedTimestampedPayload = `${timestamp}.${fixedUrl}`;
    if (verifySignature(signature, keys, fixedTimestampedPayload)) return true;
  }

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

export default verify;
