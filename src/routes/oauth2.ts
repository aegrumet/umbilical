import {
  Hono,
  Context,
  Session,
  MemoryStore,
  sessionMiddleware,
  decodeBase64Url,
} from "../../deps.ts";
import { gateFeature } from "./middleware.ts";
import { getClientKey } from "../oauth2/oauth2-helpers.ts";
import {
  handleOauth2Callback,
  handleLoginRedirect,
  handlePWATokenRequest,
  handlePWARefreshTokenRequest,
} from "../oauth2/oauth2.ts";
import verifyFromHttpRequest from "../verify.ts";
import UmbilicalContext from "../interfaces/umbilical-context.ts";

const routes = new Hono<{
  Variables: {
    session: Session;
    session_key_rotation: boolean;
  };
}>();

const store = new MemoryStore();

const middleware = sessionMiddleware({
  store,
  encryptionKey: Deno.env.get("SESSION_KEY"), // Required for CookieStore, recommended for others
  expireAfterSeconds: 900, // Expire session after 15 minutes of inactivity
  cookieOptions: {
    sameSite: "Lax", // Recommended for basic CSRF protection in modern browsers
    path: "/", // Required for this library to work properly
    httpOnly: true, // Recommended to avoid XSS attacks
  },
});

// @ts-ignore: reason: Middleware type mismatch
routes.use("*", middleware);
routes.use("*", gateFeature("oauth2"));

routes.get("/:clientkey/login", (c: Context) => {
  const decoder = new TextDecoder("utf-8");
  const oauthConfig = JSON.parse(
    decoder.decode(decodeBase64Url(Deno.env.get("OAUTH2_CONFIG")!))
  );

  const clientKey = getClientKey(c);
  if (clientKey === null || !(clientKey in oauthConfig.clients)) {
    c.status(404);
    return c.text("Oauth2 config not found.");
  }

  const pwaRedirectUri = c.req.query("redirect_uri");
  const pwaCodeChallenge = c.req.query("code_challenge");

  if (!pwaRedirectUri || !pwaCodeChallenge) {
    c.status(400);
    return c.text("Missing PWA redirect_uri or code_challenge.");
  }

  let validRedirectUri = false;
  oauthConfig.pwaRedirectUris.forEach((uri: string) => {
    if (pwaRedirectUri.startsWith(uri)) {
      validRedirectUri = true;
    }
  });
  if (!validRedirectUri) {
    c.status(400);
    return c.text("Invalid PWA redirect_uri.");
  }

  return handleLoginRedirect(c, oauthConfig.clients[clientKey]);
});

routes.get("/:clientkey/callback", (c: Context) => {
  const decoder = new TextDecoder("utf-8");
  const oauthConfig = JSON.parse(
    decoder.decode(decodeBase64Url(Deno.env.get("OAUTH2_CONFIG")!))
  );

  const clientKey = getClientKey(c);
  if (clientKey === null || !(clientKey in oauthConfig.clients)) {
    c.status(404);
    return c.text("Oauth2 config not found.");
  }

  return handleOauth2Callback(c, oauthConfig.clients[clientKey]);
});

routes.post("/:clientkey/token", async (c: Context) => {
  const bodyText = await c.req.text();

  // Handling inline, instead of in middleware, so that we can pass the
  // bodyText along. TODO: Consider moving bodyText consumption into
  // middleware.
  if (!verifyFromHttpRequest(c as UmbilicalContext, bodyText)) {
    c.status(401);
    return c.text("Unauthorized.");
  }

  const decoder = new TextDecoder("utf-8");
  const oauthConfig = JSON.parse(
    decoder.decode(decodeBase64Url(Deno.env.get("OAUTH2_CONFIG")!))
  );

  const clientKey = getClientKey(c);
  if (clientKey === null || !(clientKey in oauthConfig.clients)) {
    c.status(404);
    return c.text("Oauth2 config not found.");
  }

  return handlePWATokenRequest(c, bodyText);
});

routes.post("/:clientkey/refreshToken", async (c: Context) => {
  const bodyText = await c.req.text();

  // Handling inline, instead of in middleware, so that we can pass the
  // bodyText along. TODO: Consider moving bodyText consumption into
  // middleware.
  if (!verifyFromHttpRequest(c as UmbilicalContext, bodyText)) {
    c.status(401);
    return c.text("Unauthorized.");
  }

  const decoder = new TextDecoder("utf-8");
  const oauthConfig = JSON.parse(
    decoder.decode(decodeBase64Url(Deno.env.get("OAUTH2_CONFIG")!))
  );

  const clientKey = getClientKey(c);
  if (clientKey === null || !(clientKey in oauthConfig.clients)) {
    c.status(404);
    return c.text("Oauth2 config not found.");
  }

  return handlePWARefreshTokenRequest(
    c,
    oauthConfig.clients[clientKey],
    bodyText
  );
});

export default routes;
