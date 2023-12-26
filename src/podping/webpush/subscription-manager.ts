import { PushSubscription } from "../../../npm_deps.ts";

class SubscriptionManager {
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
    if (
      this.rssUrls[rssUrl] &&
      !this.rssUrls[rssUrl].includes(subscription.endpoint)
    ) {
      this.rssUrls[rssUrl].push(subscription.endpoint);
    } else {
      this.rssUrls[rssUrl] = [subscription.endpoint];
    }
  }

  public remove(pushSubscription: PushSubscription) {
    Object.keys(this.rssUrls).forEach((rssUrl) => {
      this.rssUrls[rssUrl] = this.rssUrls[rssUrl].filter((endpoint) => {
        return endpoint !== pushSubscription.endpoint;
      });
      if (this.rssUrls[rssUrl].length === 0) {
        delete this.rssUrls[rssUrl];
      }
    });
    delete this.pushSubscriptions[pushSubscription.endpoint];
    console.log(
      `Removed. Subscription count: ${
        Object.keys(this.pushSubscriptions).length
      }, URL count: ${Object.keys(this.rssUrls).length}`
    );
  }

  public getAllRssUrls(): string[] {
    return Object.keys(this.rssUrls);
  }

  public getAllPushSubscriptionEndpoints(): string[] {
    return Object.keys(this.pushSubscriptions);
  }

  public getSubscriptionEndpointsByRssUrl(rssUrl: string): string[] {
    return this.rssUrls[rssUrl] ?? [];
  }

  public getSubscriptionByEndpoint(endpoint: string): PushSubscription {
    return this.pushSubscriptions[endpoint];
  }

  public test(str: string): boolean {
    return (
      this.getAllRssUrls().includes(str) ||
      this.getAllRssUrls().includes(str.replace(/^http:/, "https:"))
    );
  }
}

export default SubscriptionManager;
