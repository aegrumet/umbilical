import { Hono, Context, cors } from "./deps.ts";

import SubscriptionManager from "./src/webpush/subscription-manager.ts";
import {
  isPushSubscription,
  isRegisterDeleteInput,
  isRegisterPutInput,
} from "./src/lib/type-guards.ts";

import PodpingRelayFiltered from "./src/webpush/podping-relay-filtered.ts";
import { PodpingPusher } from "./src/webpush/podping-pusher.ts";
import { PodpingFilter } from "./src/interfaces/podping-filter.ts";

const subscriptionManager: SubscriptionManager = new SubscriptionManager();
const podpingRelayFiltered = new PodpingRelayFiltered(
  subscriptionManager as PodpingFilter
);
const pusher = new PodpingPusher(subscriptionManager, podpingRelayFiltered);

const routes = new Hono();

routes.use("/*", cors());

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
routes.put("/register", async (c: Context) => {
  const body = await c.req.json();
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
routes.delete("/register", async (c: Context) => {
  const body = await c.req.json();
  if (!isRegisterDeleteInput(body)) {
    throw new TypeError("Missing or invalid pushSubscription");
  }

  const subscriptionManager: SubscriptionManager = c.get(
    "subscriptionManager"
  ) as SubscriptionManager;
  subscriptionManager.remove(body.pushSubscription);
  return c.json({ success: true });
});

export default routes;
