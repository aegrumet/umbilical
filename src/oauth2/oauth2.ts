import { Context, OAuth2Client } from "../../deps.ts";
import { OauthClientConfig } from "../interfaces/oauth2.ts";
import Oauth2Cache from "./oauth2-cache.ts";
import { getRandomCode, hash } from "./oauth2-helpers.ts";

export const handleLoginRedirect = async (
  c: Context,
  oauthConfig: OauthClientConfig
) => {
  const pwaRedirectUri = c.req.query("redirect_uri");
  const pwaCodeChallenge = c.req.query("code_challenge");
  const oauth2Client = new OAuth2Client(oauthConfig);

  // Construct the URL for the authorization redirect and get a PKCE codeVerifier
  const { uri, codeVerifier } = await oauth2Client.code.getAuthorizationUri();

  // Store session variables
  const session = c.get("session");
  session.flash("codeVerifier", codeVerifier);
  session.flash("pwaRedirectUri", pwaRedirectUri);
  session.flash("pwaCodeChallenge", pwaCodeChallenge);

  // Redirect the user to the authorization endpoint
  return c.redirect(uri.toString());
};

export const handleOauth2Callback = async (
  c: Context,
  oauthConfig: OauthClientConfig
) => {
  const oauth2Client = new OAuth2Client(oauthConfig);
  const session = c.get("session");

  // Make sure the codeVerifier is present for the user's session
  const codeVerifier = session.get("codeVerifier");
  if (typeof codeVerifier !== "string") {
    throw new Error("invalid codeVerifier");
  }

  // Exchange the authorization code for an access token
  const tokens = await oauth2Client.code.getToken(c.req.url, {
    codeVerifier,
  });

  // Generate a code for exchange with the PWA, once the umbilical-managed
  // Oauth handshakes are complete.
  const code = getRandomCode();

  const pwaRedirectUri = session.get("pwaRedirectUri");
  const pwaCodeChallenge = session.get("pwaCodeChallenge");

  // Save the oauth tokens for later exchange with the PWA.
  const cache = Oauth2Cache.getInstance();
  cache.setValue(code, {
    pwaCodeChallenge,
    tokens,
  });
  session.flash("tokens", {
    code,
    pwaCodeChallenge,
    tokens,
  });

  // redirect to PWA with our own code
  const redirectUri = new URL(pwaRedirectUri);
  redirectUri.searchParams.set("code", code);
  return c.redirect(redirectUri.toString());
};

export const handlePWATokenRequest = async (c: Context, bodyText: string) => {
  const cache = Oauth2Cache.getInstance();
  const requestBody = JSON.parse(bodyText);
  const cachedInfo = cache.getValue(requestBody.code as string);

  if (!cachedInfo) {
    c.status(404);
    return c.text("Not found.");
  }

  cache.delete(requestBody.code as string);

  // Validate the code challenge
  if (hash(requestBody.code_verifier) !== cachedInfo.pwaCodeChallenge) {
    c.status(400);
    return c.text("Invalid code challenge.");
  }
  return c.json(cachedInfo.tokens);
};
