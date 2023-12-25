import { describe, it, beforeEach, assertEquals } from "../../../dev_deps.ts";
import SubscriptionManager from "./subscription-manager.ts";

describe("Stateful podping relay", () => {
  let subscriptionManager: SubscriptionManager;

  beforeEach(() => {
    subscriptionManager = new SubscriptionManager();
  });

  it("Subscribes and unsubscribes strings", () => {
    const testPatterns = [
      "https://example.com/feed1",
      "https://example.com/feed2",
    ];

    subscriptionManager.subscribe(testPatterns[0]);
    assertEquals(subscriptionManager.patterns.length, 1);
    assertEquals(
      subscriptionManager.patterns[0],
      new RegExp("^" + subscriptionManager.escapeRegExp(testPatterns[0]) + "$")
    );
    subscriptionManager.subscribe(testPatterns[1]);
    subscriptionManager.unsubscribe(testPatterns[0]);
    assertEquals(subscriptionManager.patterns.length, 1);
    assertEquals(
      subscriptionManager.patterns[0],
      new RegExp("^" + subscriptionManager.escapeRegExp(testPatterns[1]) + "$")
    );
  });

  it("Subscribes and unsubscribes string arrays", () => {
    const testPatterns = [
      "https://example.com/feed1",
      "https://example.com/feed2",
    ];

    subscriptionManager.subscribe(testPatterns);
    assertEquals(subscriptionManager.patterns.length, testPatterns.length);
    testPatterns.forEach((pattern, index) => {
      assertEquals(
        subscriptionManager.patterns[index].source,
        new RegExp("^" + subscriptionManager.escapeRegExp(pattern) + "$").source
      );
    });
    subscriptionManager.unsubscribe([testPatterns[0]]);
    assertEquals(subscriptionManager.patterns.length, 1);
    assertEquals(
      subscriptionManager.patterns[0].source,
      new RegExp("^" + subscriptionManager.escapeRegExp(testPatterns[1]) + "$")
        .source
    );
  });

  it("Subscribes and unsubscribes regexp strings", () => {
    // prettier-ignore
    const testPatterns = ["\.rss$", "\.xml$"];

    subscriptionManager.subscribeRegExp(testPatterns[0]);
    assertEquals(subscriptionManager.patterns.length, 1);
    assertEquals(subscriptionManager.patterns[0], new RegExp(testPatterns[0]));
    subscriptionManager.subscribeRegExp(testPatterns[1]);
    subscriptionManager.unsubscribeRegExp(testPatterns[0]);
    assertEquals(subscriptionManager.patterns.length, 1);
    assertEquals(subscriptionManager.patterns[0], new RegExp(testPatterns[1]));
  });

  it("Subscribes and unsubscribes regexp string arrays", () => {
    // prettier-ignore
    const testPatterns = ["\.rss$", "\.xml$"];

    subscriptionManager.subscribeRegExp(testPatterns);
    assertEquals(subscriptionManager.patterns.length, testPatterns.length);
    testPatterns.forEach((pattern, index) => {
      assertEquals(
        subscriptionManager.patterns[index].source,
        new RegExp(pattern).source
      );
    });
    subscriptionManager.unsubscribeRegExp([testPatterns[0]]);
    assertEquals(subscriptionManager.patterns.length, 1);
    assertEquals(
      subscriptionManager.patterns[0].source,
      new RegExp(testPatterns[1]).source
    );
  });
});
