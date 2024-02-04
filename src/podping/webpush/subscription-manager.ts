import { PushSubscription } from "../../../server_deps.ts";
import { PodpingFilter } from "../../interfaces/podping-filter.ts";
import { normalizedKeyFromUrl } from "../../lib/url.ts";

class SubscriptionManager implements PodpingFilter {
  private rssUrls: Record<string, string[]> = {};
  private pushSubscriptions: Record<string, PushSubscription> = {};

  public add(pushSubscription: PushSubscription, rssUrls: string[]): void {
    this.remove(pushSubscription);
    this.pushSubscriptions[pushSubscription.endpoint] = pushSubscription;

    // Refresh rssUrls
    rssUrls.forEach((rssUrl) => {
      this.addRssUrlToPushSubscription(pushSubscription, rssUrl);
    });

    console.log(
      `Added. Subscription count: ${
        Object.keys(this.pushSubscriptions).length
      }, URL count: ${Object.keys(this.rssUrls).length}`
    );
  }

  public addRssUrlToPushSubscription(
    subscription: PushSubscription,
    rssUrl: string
  ) {
    const normalizedRssKey = normalizedKeyFromUrl(rssUrl);
    if (
      this.rssUrls[normalizedRssKey] &&
      !this.rssUrls[normalizedRssKey].includes(subscription.endpoint)
    ) {
      this.rssUrls[normalizedRssKey].push(subscription.endpoint);
    } else {
      this.rssUrls[normalizedRssKey] = [subscription.endpoint];
    }
  }

  public remove(pushSubscription: PushSubscription) {
    Object.keys(this.rssUrls).forEach((normalizedRssKey) => {
      this.rssUrls[normalizedRssKey] = this.rssUrls[normalizedRssKey].filter(
        (endpoint) => {
          return endpoint !== pushSubscription.endpoint;
        }
      );
      if (this.rssUrls[normalizedRssKey].length === 0) {
        delete this.rssUrls[normalizedRssKey];
      }
    });
    delete this.pushSubscriptions[pushSubscription.endpoint];
    console.log(
      `Removed. Subscription count: ${
        Object.keys(this.pushSubscriptions).length
      }, URL count: ${Object.keys(this.rssUrls).length}`
    );
  }

  public getAllNormalizedRssKeys(): string[] {
    return Object.keys(this.rssUrls);
  }

  public getAllPushSubscriptionEndpoints(): string[] {
    return Object.keys(this.pushSubscriptions);
  }

  public getSubscriptionEndpointsByRssUrl(rssUrl: string): string[] {
    const normalizedRssKey = normalizedKeyFromUrl(rssUrl);
    return this.rssUrls[normalizedRssKey] ?? [];
  }

  public getSubscriptionByEndpoint(endpoint: string): PushSubscription {
    return this.pushSubscriptions[endpoint];
  }

  public test(str: string): boolean {
    const normalizedRssKey = normalizedKeyFromUrl(str);
    return this.getAllNormalizedRssKeys().includes(normalizedRssKey);
  }
}

export default SubscriptionManager;
