import { describe, it, expect } from "../../dev_deps.ts";

import { validPushSubscription } from "../../mocks/push-subscription.ts";
import SubscriptionManager from "./subscription-manager.ts";
import { PushSubscription } from "../../deps.ts";

describe("Subscription Manager", () => {
  it("should create", () => {
    const subscriptionManager = new SubscriptionManager();
    expect(subscriptionManager).toBeTruthy();
  });
  it("should add a single push subscription", () => {
    const rssUrl = "https://example.com/rss";
    const subscriptionManager = new SubscriptionManager();
    subscriptionManager.add(validPushSubscription, rssUrl);
    expect(subscriptionManager.getAllRssUrls()).toEqual([rssUrl]);
    expect(subscriptionManager.getAllPushSubscriptionEndpoints()).toEqual([
      validPushSubscription.endpoint,
    ]);
  });
  it("should add multiple rssUrls to a single push subscription", () => {
    const rssUrls = ["https://example.com/rss1", "https://example.com/rss2"];
    const subscriptionManager = new SubscriptionManager();
    subscriptionManager.add(validPushSubscription, rssUrls);
    expect(subscriptionManager.getAllRssUrls()).toEqual(rssUrls);
    expect(subscriptionManager.getAllPushSubscriptionEndpoints()).toEqual([
      validPushSubscription.endpoint,
    ]);
  });
  it("should add multiple push subscriptions", () => {
    const rssUrl = "https://example.com/rss";
    const subscriptionManager = new SubscriptionManager();
    subscriptionManager.add(
      {
        ...validPushSubscription,
        endpoint: "https://example.com/endpoint1",
      } as PushSubscription,
      rssUrl
    );
    subscriptionManager.add(
      {
        ...validPushSubscription,
        endpoint: "https://example.com/endpoint2",
      } as PushSubscription,
      rssUrl
    );
    expect(subscriptionManager.getAllRssUrls()).toEqual([rssUrl]);
    expect(
      subscriptionManager.getAllPushSubscriptionEndpoints().length
    ).toEqual(2);
  });
  it("should remove a subscription", () => {
    const rssUrl = "https://example.com/rss";
    const subscriptionManager = new SubscriptionManager();
    subscriptionManager.add(
      {
        ...validPushSubscription,
        endpoint: "https://example.com/endpoint1",
      } as PushSubscription,
      rssUrl
    );
    subscriptionManager.add(
      {
        ...validPushSubscription,
        endpoint: "https://example.com/endpoint2",
      } as PushSubscription,
      rssUrl
    );
    subscriptionManager.remove({
      ...validPushSubscription,
      endpoint: "https://example.com/endpoint1",
    } as PushSubscription);
    expect(subscriptionManager.getAllRssUrls()).toEqual([rssUrl]);
    expect(subscriptionManager.getAllPushSubscriptionEndpoints()).toEqual([
      "https://example.com/endpoint2",
    ]);
  });
  it("should match the non-https of a subscription added with https", () => {
    const rssUrl = "https://example.com/rss";
    const subscriptionManager = new SubscriptionManager();
    subscriptionManager.add(validPushSubscription, rssUrl);
    expect(subscriptionManager.test("http://example.com/rss")).toBeTruthy();
  });

  it("should return an empty array for an rssUrl with no subscriptions", () => {
    const rssUrl = "https://example.com/rss";
    const subscriptionManager = new SubscriptionManager();
    expect(
      subscriptionManager.getSubscriptionEndpointsByRssUrl(rssUrl)
    ).toEqual([]);
  });

  it("should return an empty array for all push subcription endpoints when first initialized", () => {
    const subscriptionManager = new SubscriptionManager();
    expect(subscriptionManager.getAllPushSubscriptionEndpoints()).toEqual([]);
  });
});
