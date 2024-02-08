import { encodeBase64Url } from "../deps.ts";

async function generateVapidKey() {
  const key = await window.crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
  const serverKey = await window.crypto.subtle.exportKey("jwk", key.privateKey);
  const serverKeyString = JSON.stringify(serverKey, null, 0);
  const vapidKey = encodeBase64Url(serverKeyString);
  return vapidKey;
}

const key = await generateVapidKey();
console.log(key);
