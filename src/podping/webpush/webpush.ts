// Dec 2023: Deno's built-in crypto doesn't fully support npm:web-push, so we're
// using K0IN's implementation.
// Jun 2024: Deno's got better crypto support now but still not quite working, see
// https://github.com/denoland/deno/issues/23693
import type { JWK } from "https://raw.githubusercontent.com/K0IN/Notify/v0.0.6/app/backend/webpush/jwk.ts";
import {
  WebPushInfos,
  WebPushMessage,
  WebPushResult,
} from "https://raw.githubusercontent.com/K0IN/Notify/v0.0.6/app/backend/webpush/webpushinfos.ts";
import { generateAESGCMEncryptedMessage } from "https://raw.githubusercontent.com/K0IN/Notify/v0.0.6/app/backend/webpush/message.ts";
import { generateV2Headers } from "https://raw.githubusercontent.com/K0IN/Notify/v0.0.6/app/backend/webpush/vapid.ts";
import {
  b64ToUrlEncoded,
  exportPublicKeyPair,
} from "https://raw.githubusercontent.com/K0IN/Notify/v0.0.6/app/backend/webpush/util.ts";
export type { JWK, WebPushMessage, WebPushResult };
export { b64ToUrlEncoded, exportPublicKeyPair };

// https://raw.githubusercontent.com/K0IN/Notify/main/app/backend/webpush/webpush.ts
// With minor modification to skip base64 encoding the message data.
export async function sendWebPushMessage(
  message: WebPushMessage,
  deviceData: WebPushInfos,
  applicationServerKeys: JWK
): Promise<WebPushResult> {
  // const binString = toBinary(message.data);
  // const dataB64 = btoa(binString);

  const [authHeaders, encryptedPayloadDetails] = await Promise.all([
    generateV2Headers(deviceData.endpoint, applicationServerKeys, message.sub),
    // generateAESGCMEncryptedMessage(dataB64, deviceData)
    generateAESGCMEncryptedMessage(message.data, deviceData),
  ]);

  const headers: { [headerName: string]: string } = { ...authHeaders };

  headers["Encryption"] = `salt=${encryptedPayloadDetails.salt}`;
  headers["Crypto-Key"] = `dh=${encryptedPayloadDetails.publicServerKey}`;
  headers["Content-Encoding"] = "aesgcm";
  headers["Content-Type"] = "application/octet-stream";

  // setup message headers
  headers["TTL"] = `${message.ttl}`;
  headers["Urgency"] = `${message.urgency}`;

  const res = await fetch(deviceData.endpoint, {
    method: "POST",
    headers,
    body: encryptedPayloadDetails.cipherText,
  });

  switch (res.status) {
    case 200: // http ok
    case 201: // http created
    case 204: // http no content
      return WebPushResult.Success;

    case 400: // http bad request
    case 401: // http unauthorized
    case 404: // http not found
    case 410: // http gone
      return WebPushResult.NotSubscribed;
  }

  console.error(`Web Push error: ${res.status} body: ${await res.text()}`);
  return WebPushResult.Error;
}

// Might come in handy if we decide to move off of jwk format.
export async function extractPrivateKeyUrlSafeBase64(jwk: JWK) {
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "ECDSA",
      namedCurve: jwk.crv,
    },
    true,
    ["sign"]
  );

  // Extracts the private key
  const exportedKey = await crypto.subtle.exportKey("pkcs8", key);

  // Converts the exported key to URL-safe Base64 format
  const base64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return base64;
}
