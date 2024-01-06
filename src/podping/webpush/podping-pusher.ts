import { Evt, decodeBase64Url, Eta } from "../../../deps.ts";
import { PushSubscription } from "../../../npm_deps.ts";
import {
  PodpingV0,
  PodpingV1,
} from "../../interfaces/livewire-podping-websocket.ts";
import PodpingRelayFiltered from "../shared/podping-relay-filtered.ts";
import SubscriptionManager from "./subscription-manager.ts";
import {
  sendWebPushMessage,
  b64ToUrlEncoded,
  exportPublicKeyPair,
  JWK,
  WebPushMessage,
  WebPushResult,
} from "./webpush.ts";
import { NOTIFICATION_TEMPLATES } from "./notification-templates.ts";

export class PodpingPusher {
  podpingEmitter: Evt<PodpingV0 | PodpingV1 | Error>;
  subscriptionManager: SubscriptionManager;
  relay: PodpingRelayFiltered;

  isAlive = false;
  interval: number | undefined;

  webpushJwkBase64: string;
  webpushSub: string;

  vapidKeys: Readonly<JWK>;
  publicKey: string;

  constructor(
    subscriptionManager: SubscriptionManager,
    podpingRelayFiltered: PodpingRelayFiltered,
    webpushJwkBase64: string,
    webpushSub: string
  ) {
    this.subscriptionManager = subscriptionManager;
    this.relay = podpingRelayFiltered;
    this.relay.connect();
    this.podpingEmitter = this.relay.getEmitter();

    this.webpushJwkBase64 = webpushJwkBase64;
    const vapidKeysJson = atob(this.webpushJwkBase64);
    this.vapidKeys = JSON.parse(vapidKeysJson);
    this.publicKey = b64ToUrlEncoded(exportPublicKeyPair(this.vapidKeys));
    this.webpushSub = webpushSub;

    console.log(`Configured push with public key: ${this.publicKey}`);
    this.listen();
  }

  async listen() {
    for await (const podping of this.podpingEmitter) {
      if (typeof podping === typeof Error) {
        console.log("emitter error", podping);
      } else {
        this.handlePodping(podping as PodpingV0 | PodpingV1);
      }
    }
  }
  async broadcast(podping: PodpingV1): Promise<void> {
    const notifications: Promise<WebPushResult | void>[] = [];

    const endpoints = this.subscriptionManager.getSubscriptionEndpointsByRssUrl(
      podping.iris[0]
    );

    // Angular-style notification body, see
    // https://angular.io/guide/service-worker-notifications#notification-click-handling
    const notification = renderNotificationTemplate(podping, "angular");

    if (notification === null) {
      console.log(
        `Error rendering notification for podping. There's probably a problem with the template. No notification will be sent.`
      );
      return;
    }

    const webPushMessageInfo: WebPushMessage = {
      data: JSON.stringify(notification),
      urgency: "normal",
      sub: this.webpushSub,
      ttl: 60 * 24 * 7,
    };

    endpoints.forEach((endpoint: string) => {
      const subscription = this.subscriptionManager.getSubscriptionByEndpoint(
        endpoint
      ) as unknown as PushSubscription;
      const p = sendWebPushMessage(
        webPushMessageInfo,
        {
          endpoint: subscription.endpoint,
          auth: base64UrlToBase64(subscription.keys.auth),
          key: base64UrlToBase64(subscription.keys.p256dh),
        },
        this.vapidKeys
      );
      notifications.push(
        p.catch((e: Error) => console.error("Caught web-push error", e))
      );
    });

    await Promise.all(notifications);
  }

  inject(url: string, reason: string) {
    this.relay.inject(url, reason);
  }

  handlePodping(podping: PodpingV0 | PodpingV1) {
    //NB: The emitter will fire once per matching iri or url,
    //and return a length-1 podping payload for each.
    if ("iris" in podping) {
      this.broadcast(podping);
    }
    if ("urls" in podping) {
      this.broadcast({
        version: "1.0",
        reason: "update",
        medium: "podcast",
        iris: [podping.urls[0]],
      } as PodpingV1);
    }
  }

  getPublicKey(): string {
    return this.publicKey;
  }
}

// Renders a JSON/ETA template and parses to JSON.
// Returns null on errors.
export function renderNotificationTemplate(
  podping: PodpingV1,
  templateKey: string
  // deno-lint-ignore no-explicit-any
): any {
  if (!NOTIFICATION_TEMPLATES[templateKey]) {
    console.log(`Error: no notification template found for key ${templateKey}`);
    return null;
  }
  const eta = new Eta();
  const serializedJson = eta.renderString(
    NOTIFICATION_TEMPLATES[templateKey],
    podping
  );
  // deno-lint-ignore no-explicit-any
  let result: any = null;
  try {
    result = JSON.parse(serializedJson);
  } catch (e) {
    console.log(
      `Error parsing JSON from ETA template for key ${templateKey}`,
      e
    );
    return null;
  }
  return result;
}

// The web push sender expects vanilla base64, not base64url.
export function base64UrlToBase64(str: string): string {
  let binary = "";
  const bytes = decodeBase64Url(str);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
