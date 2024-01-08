import {
  describe,
  it,
  beforeEach,
  FakeTime,
  assertEquals,
  afterEach,
} from "../../../dev_deps.ts";
import { MockUmbilicalContext } from "../../../mocks/umbilical-context.ts";
import PodpingCache from "./podping-cache.ts";

describe("Podping Cache", () => {
  let cache: PodpingCache;

  beforeEach(() => {
    new FakeTime(); // Allows cache tests to run without leaking async ops.
    cache = PodpingCache.getInstance(
      Number(MockUmbilicalContext.env.PODPING_TIMEOUT_MINUTES)
    );
    cache.reset();
  });

  afterEach(() => {});

  it("Returns true for shouldNotify when the cache is empty", () => {
    const iri = "https://example.com";
    const reason = "update";

    const shouldNotify = cache.shouldNotify(iri, reason);
    assertEquals(shouldNotify, true);
  });

  it("Returns false for shouldNotify when the cache has a matching entry that hasn't expired", () => {
    const iri = "https://example.com";
    const reason = "update";

    cache.markNotified(iri, reason);

    const shouldNotify = cache.shouldNotify(iri, reason);
    assertEquals(shouldNotify, false);
  });

  it("Returns true for shouldNotify when the cache has a matching entry that has expired", () => {
    const iri = "https://example.com";
    const reason = "update";

    cache.markNotifiedWithDate(
      iri,
      reason,
      new Date(
        Date.now() -
          (Number(MockUmbilicalContext.env.PODPING_TIMEOUT_MINUTES) + 1) *
            60 *
            1000
      )
    );

    const shouldNotify = cache.shouldNotify(iri, reason);
    assertEquals(shouldNotify, true);
  });
});
