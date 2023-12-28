import {
  describe,
  it,
  beforeEach,
  FakeTime,
  stub,
  assertSpyCalls,
  spy,
} from "../../../dev_deps.ts";
import PodpingRelay from "./podping-relay.ts";
import PodpingRelayFactory from "./podping-relay-factory.ts";
import PodpingRelayFiltered from "./podping-relay-filtered.ts";
import MockPodpingFilter from "../../../mocks/podping-filter.ts";
import MockPodpingRelay from "../../../mocks/podping-relay.ts";

describe("Filtered podping relay", () => {
  let time: FakeTime;
  let mockPodpingRelay: MockPodpingRelay;
  let podpingRelayFactory: PodpingRelayFactory;

  beforeEach(() => {
    time = new FakeTime();
    podpingRelayFactory = PodpingRelayFactory.getInstance();
    mockPodpingRelay = new MockPodpingRelay();
  });

  it("Passes matching 1.0 messages", async () => {
    const iri = "https://example.com";

    const run = stub(podpingRelayFactory, "getPodpingRelay", () => {
      return mockPodpingRelay as unknown as PodpingRelay;
    });

    const relayFiltered = new PodpingRelayFiltered(
      new MockPodpingFilter([iri])
    );

    const postUpdateSpy = spy(relayFiltered, "postUpdate");
    try {
      relayFiltered.connect();
      await time.runMicrotasks();
      mockPodpingRelay.emit(iri);
      await time.runMicrotasks();
      assertSpyCalls(postUpdateSpy, 1);
    } finally {
      postUpdateSpy.restore();
      run.restore();
    }
  });

  it("Filters out non-matching 1.0 messages", async () => {
    const iri = "https://example.com";

    const run = stub(podpingRelayFactory, "getPodpingRelay", () => {
      return mockPodpingRelay as unknown as PodpingRelay;
    });

    const relayFiltered = new PodpingRelayFiltered(
      new MockPodpingFilter([iri])
    );

    const postUpdateSpy = spy(relayFiltered, "postUpdate");
    try {
      relayFiltered.connect();
      await time.runMicrotasks();
      mockPodpingRelay.emit(`not${iri}`);
      await time.runMicrotasks();
      assertSpyCalls(postUpdateSpy, 0);
    } finally {
      postUpdateSpy.restore();
      run.restore();
    }
  });
});
