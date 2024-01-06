# Authentication Examples

## Signing a request - TypeScript

```typescript
/***
 * Creates a signature for Umbilical requests.
 *
 * @param {string} fullUrl - The full URL of the request.
 * @param {string} secretKey - The secret key to use for signing.
 * @param {string} requestBody - The body of the request. Will typically be empty for GETs.
 * @return {string} The signature string.
 */
export async function getUmbilicalSignature(
  fullUrl: string,
  secretKey: string,
  requestBody: string = ""
): Promise<string> {
  let result = "";

  const enc = new TextEncoder();
  const url = new URL(fullUrl);
  const timestamp = Date.now();
  const timestampedPayload = `${timestamp}.${fullUrl.slice(
    url.protocol.length + 2
  )}.${requestBody}`;

  const key = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign", "verify"]
  );

  const signature = await window.crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(timestampedPayload)
  );

  const b = new Uint8Array(signature);
  result = Array.prototype.map
    .call(b, (x) => x.toString(16).padStart(2, "0"))
    .join("");

  return `t=${timestamp},s=${result}`;
}
```
