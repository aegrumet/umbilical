import { Hono, Context } from "../../deps.ts";

import SubscriptionManager from "../podping/webpush/subscription-manager.ts";
import {
  isPushSubscription,
  isRegisterDeleteInput,
  isRegisterPutInput,
} from "../lib/type-guards.ts";

import PodpingRelayFiltered from "../podping/shared/podping-relay-filtered.ts";
import { PodpingPusher } from "../podping/webpush/podping-pusher.ts";
import { PodpingFilter } from "../interfaces/podping-filter.ts";
import { ENABLED_FEATURES_DEFAULT } from "../env-defaults.ts";
import { authenticate, gateFeature } from "./middleware.ts";
import verify from "../verify.ts";
import UmbilicalContext from "../interfaces/umbilical-context.ts";

const routes = new Hono();
routes.use("/pubkey", authenticate);
routes.use("*", gateFeature("podping_webpush"));

// The PodpingPusher is always-on even when there is no connection context. For
// this reason we can't pull environment variable values from c.env, so we
// reference Deno directly. NB: This is incompatible work with Cloudflare
// Workers.
if (
  (Deno.env.get("ENABLED_FEATURES") ?? ENABLED_FEATURES_DEFAULT).includes(
    "podping_webpush"
  )
) {
  const subscriptionManager: SubscriptionManager = new SubscriptionManager();
  const podpingRelayFiltered = new PodpingRelayFiltered(
    subscriptionManager as PodpingFilter
  );

  const pusher = new PodpingPusher(
    subscriptionManager,
    podpingRelayFiltered,
    Deno.env.get("WEBPUSH_JWK_BASE64") || "",
    Deno.env.get("WEBPUSH_CONTACT") || "mailto:test@test.com"
  );

  routes.use("*", async (c: Context, next) => {
    c.set("subscriptionManager", subscriptionManager);
    await next();
  });

  routes.get("/pubkey", (c) => c.text(pusher.getPublicKey()));

  /* Register PUT takes
   * {
   *   "pushSubscription": PushSubscription,
   *   "rssUrls": string | string[]
   * }
   */
  routes.put("/subscription", async (c: Context) => {
    const bodyText = await c.req.text();

    // Handling inline, instead of in middleware, so that we can pass the
    // bodyText along. TODO: Consider moving bodyText consumption into
    // middleware.
    if (!verify(c as UmbilicalContext, bodyText)) {
      c.status(401);
      return c.text("Unauthorized.");
    }

    const body = JSON.parse(bodyText);
    if (!isRegisterPutInput(body)) {
      if (!isPushSubscription(body.pushSubscription)) {
        throw new TypeError("Invalid pushSubscription");
      } else {
        throw new TypeError("Invalid rssUrls");
      }
    }

    const subscriptionManager: SubscriptionManager = c.get(
      "subscriptionManager"
    ) as SubscriptionManager;
    subscriptionManager.add(body.pushSubscription, body.rssUrls);

    return c.json({ success: true });
  });

  /* Register DELETE takes
   * {
   *   "pushSubscription": PushSubscription,
   * }
   */
  routes.delete("/subscription", async (c: Context) => {
    const bodyText = await c.req.text();

    // Handling inline, instead of in middleware, so that we can pass the
    // bodyText along. TODO: Consider moving bodyText consumption into
    // middleware.
    if (!verify(c as UmbilicalContext, bodyText)) {
      c.status(401);
      return c.text("Unauthorized.");
    }

    const body = JSON.parse(bodyText);
    if (!isRegisterDeleteInput(body)) {
      throw new TypeError("Missing or invalid pushSubscription");
    }

    const subscriptionManager: SubscriptionManager = c.get(
      "subscriptionManager"
    ) as SubscriptionManager;
    subscriptionManager.remove(body.pushSubscription);
    return c.json({ success: true });
  });

  if (Deno.env.get("DEBUG") === "true") {
    routes.get("/inject", (c: Context) => {
      let url: string | undefined = "https://mp3s.nashownotes.com/pc20rss.xml";
      if (c.req.query("url")) {
        url = c.req.query("url");
      }
      let reason: string | undefined = "update";
      if (c.req.query("reason")) {
        reason = c.req.query("reason");
      }
      pusher.inject(url!, reason!);
      return c.text("ok");
    });
  }
}

export default routes;
