import { describe, it, beforeEach, assertEquals } from "../../../dev_deps.ts";
import SubscriptionManager from "./subscription-manager.ts";
import { normalizedKeyFromUrl } from "../../lib/url.ts";

describe("Stateful podping relay", () => {
  let subscriptionManager: SubscriptionManager;

  beforeEach(() => {
    subscriptionManager = new SubscriptionManager();
  });

  it("Adds and deletes rssUrls", () => {
    const testPatterns = [
      "https://example.com/feed1",
      "https://example.com/feed2",
    ];

    subscriptionManager.addRssUrls(testPatterns);
    assertEquals(subscriptionManager.patterns.length, testPatterns.length);
    testPatterns.forEach((pattern, index) => {
      assertEquals(
        subscriptionManager.patterns[index].source,
        new RegExp(
          "^" +
            subscriptionManager.escapeRegExp(normalizedKeyFromUrl(pattern)) +
            "$"
        ).source
      );
    });
    subscriptionManager.deleteRssUrls([testPatterns[0]]);
    assertEquals(subscriptionManager.patterns.length, 1);
    assertEquals(
      subscriptionManager.patterns[0].source,
      new RegExp(
        "^" +
          subscriptionManager.escapeRegExp(
            normalizedKeyFromUrl(testPatterns[1])
          ) +
          "$"
      ).source
    );
  });

  it("Adds and deletes regexp string arrays", () => {
    // prettier-ignore
    const testPatterns = ["\.rss$", "\.xml$"];

    subscriptionManager.addRssUrlsRegExp(testPatterns);
    assertEquals(subscriptionManager.patterns.length, testPatterns.length);
    testPatterns.forEach((pattern, index) => {
      assertEquals(
        subscriptionManager.patterns[index].source,
        new RegExp(pattern).source
      );
    });
    subscriptionManager.deleteRssUrlsRegExp([testPatterns[0]]);
    assertEquals(subscriptionManager.patterns.length, 1);
    assertEquals(
      subscriptionManager.patterns[0].source,
      new RegExp(testPatterns[1]).source
    );
  });
});
