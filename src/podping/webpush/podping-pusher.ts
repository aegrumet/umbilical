import { Evt, decodeBase64Url } from "../../../deps.ts";
import { PushSubscription } from "../../../npm_deps.ts";
import {
  PodpingV0,
  PodpingV1,
} from "../../interfaces/livewire-podping-websocket.ts";
import PodpingRelayFiltered from "./podping-relay-filtered.ts";
import SubscriptionManager from "./subscription-manager.ts";
import {
  sendWebPushMessage,
  b64ToUrlEncoded,
  exportPublicKeyPair,
  JWK,
  WebPushMessage,
  WebPushResult,
} from "./webpush.ts";

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
  async broadcast(url: string, reason: string): Promise<void> {
    const notifications: Promise<WebPushResult | void>[] = [];

    const endpoints =
      this.subscriptionManager.getSubscriptionEndpointsByRssUrl(url);

    // Angular-style notification body, see
    // https://angular.io/guide/service-worker-notifications#notification-click-handling
    // TODO: Make this templatized and selectable.
    const notification = {
      title: `New podping: ${url}, ${reason}`,
      notification: {
        title: `New podping: ${url}, ${reason}`,
        data: {
          onActionClick: {
            default: {
              operation: "navigateLastFocusedOrOpen",
              url: `/show-episodes?rssUrl=${encodeURIComponent(
                url
              )}&source=podping-${encodeURIComponent(reason)}`,
            },
          },
        },
      },
    };

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

  async testPush(url: string, reason: string): Promise<void> {
    const notifications: Promise<WebPushResult | void>[] = [];

    const endpoints =
      this.subscriptionManager.getAllPushSubscriptionEndpoints();

    // Angular-style notification body, see
    // https://angular.io/guide/service-worker-notifications#notification-click-handling
    // TODO: Make this templatized and selectable.
    const notification = {
      notification: {
        title: `New podping: ${url}, ${reason}`,
        data: {
          onActionClick: {
            default: {
              operation: "navigateLastFocusedOrOpen",
              url: `/show-episodes?rssUrl=${encodeURIComponent(
                url
              )}&source=podping-${encodeURIComponent(reason)}`,
            },
          },
        },
      },
    };

    const webPushMessageInfo: WebPushMessage = {
      data: JSON.stringify(notification),
      urgency: "normal",
      sub: this.webpushSub,
      ttl: 60 * 24 * 7,
    };

    endpoints.forEach((endpoint: string) => {
      console.log(`Sending test notification to ${endpoint}`);
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

  handlePodping(podping: PodpingV0 | PodpingV1) {
    //NB: The emitter will fire once per matching iri or url,
    //and return a length-1 podping payload for each.
    if ("iris" in podping) {
      this.broadcast(podping.iris[0], podping.reason);
    }
    if ("urls" in podping) {
      this.broadcast(podping.urls[0], podping.reason);
    }
  }

  getPublicKey(): string {
    return this.publicKey;
  }
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
