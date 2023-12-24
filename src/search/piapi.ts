import { encodeHex } from "../../deps.ts";
import umbilicalUserAgent from "../config.ts";
import { UmbilicalContext } from "../interfaces/umbilical-context.ts";

const API = "https://api.podcastindex.org/api/1.0";

export const checkEnv = (c: UmbilicalContext) => {
  const apiKey = c.env.PI_API_KEY;
  const apiSecret = c.env.PI_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Invalid API key or secret");
  }

  return { apiKey, apiSecret };
};

const searchByTerm = async (query: string, c: UmbilicalContext) => {
  const { apiKey, apiSecret } = checkEnv(c);

  const timestamp = Math.floor(Date.now() / 1000);

  // This will delegate to the runtime's WebCrypto implementation.
  const Authorization = encodeHex(
    await crypto.subtle.digest(
      "SHA-1",
      new TextEncoder().encode(apiKey + apiSecret + timestamp)
    )
  );

  const url = `${API}/search/byterm?q=${query}`;
  const options = {
    method: "GET",
    headers: {
      "User-Agent": umbilicalUserAgent,
      "X-Auth-Date": "" + timestamp,
      "X-Auth-Key": apiKey,
      Authorization,
    },
  };

  const res = await fetch(url, options);
  if (res.status < 200 || res.status >= 300) {
    throw new Error("Error calling podcast index api");
  }

  return await res.json();
};

export default searchByTerm;
