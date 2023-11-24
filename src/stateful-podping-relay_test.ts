import { Stub, spy } from "https://deno.land/std@0.207.0/testing/mock.ts";
import {
  describe,
  it,
  beforeEach,
  FakeTime,
  stub,
  assertSpyCalls,
} from "../dev_deps.ts";
import MockWebsocketStubBuilder from "../mocks/websocket.ts";
import StatefulPodpingRelay, {
  MAX_CONNECT_ATTEMPTS,
} from "./stateful-podping-relay.ts";
import { mockLivewireMessage } from "../mocks/livewire-podping.ts";

describe("Stateful podping relay", () => {
  let time: FakeTime;
  let relay: StatefulPodpingRelay;
  let newWebSocketStub: Stub;

  beforeEach(() => {
    time = new FakeTime();
    relay = new StatefulPodpingRelay();
  });

  it("opens a websocket on connect", () => {
    const builder: MockWebsocketStubBuilder = new MockWebsocketStubBuilder();

    newWebSocketStub = stub(
      relay,
      "newWebSocket",
      builder.build("ws://example.com", {
        openAfterAttempts: 1,
        openCurrentAttempt: 0,
        openGoSilentAfterAttempts: 1,
      })
    );
    const handleOpenSpy = spy(relay, "handleOpen");
    try {
      relay.connect();
      time.tick(10);
      assertSpyCalls(handleOpenSpy, 1);
    } finally {
      handleOpenSpy.restore();
      newWebSocketStub.restore();
    }
  });

  it("attempts reconnect on error", () => {
    const builder: MockWebsocketStubBuilder = new MockWebsocketStubBuilder();

    newWebSocketStub = stub(
      relay,
      "newWebSocket",
      builder.build("ws://example.com", {
        openAfterAttempts: 0,
        openCurrentAttempt: 0,
        openGoSilentAfterAttempts: 1,
      })
    );
    const connectSpy = spy(relay, "connect");
    try {
      relay.connect();
      time.tick(1000000);
      assertSpyCalls(connectSpy, 2); // should be 1 greater than openGoSilentAfterAttempts
    } finally {
      connectSpy.restore();
      newWebSocketStub.restore();
    }
  });

  it(`gives up after ${MAX_CONNECT_ATTEMPTS} tries`, () => {
    const builder: MockWebsocketStubBuilder = new MockWebsocketStubBuilder();

    newWebSocketStub = stub(
      relay,
      "newWebSocket",
      builder.build("ws://example.com", {
        openAfterAttempts: 0,
        openCurrentAttempt: 0,
        openGoSilentAfterAttempts: MAX_CONNECT_ATTEMPTS + 3,
      })
    );
    const connectSpy = spy(relay, "connect");
    try {
      relay.connect();
      time.tick(1000000); // Make sure this is large enough to exceed the exponential backoff
      assertSpyCalls(connectSpy, MAX_CONNECT_ATTEMPTS);
    } finally {
      connectSpy.restore();
      newWebSocketStub.restore();
    }
  });

  it("Passes no messages until subscribed", () => {
    const builder: MockWebsocketStubBuilder = new MockWebsocketStubBuilder();

    newWebSocketStub = stub(
      relay,
      "newWebSocket",
      builder.build("ws://example.com", {
        openAfterAttempts: 1,
        openCurrentAttempt: 0,
        openGoSilentAfterAttempts: 1,
      })
    );
    const postUpdateSpy = spy(relay, "postUpdate");
    try {
      relay.connect();
      time.tick(10);
      builder.mockWebsocketInstance?.emit(
        "message",
        new MessageEvent<any>("message", {
          data: JSON.stringify(mockLivewireMessage()),
        })
      );
      time.tick(10);
      assertSpyCalls(postUpdateSpy, 0);
    } finally {
      postUpdateSpy.restore();
      newWebSocketStub.restore();
    }
  });

  it("Passes matching 1.0 messages", () => {
    const builder: MockWebsocketStubBuilder = new MockWebsocketStubBuilder();
    const msg = mockLivewireMessage();

    newWebSocketStub = stub(
      relay,
      "newWebSocket",
      builder.build("ws://example.com", {
        openAfterAttempts: 1,
        openCurrentAttempt: 0,
        openGoSilentAfterAttempts: 1,
      })
    );
    const postUpdateSpy = spy(relay, "postUpdate");
    try {
      relay.connect();
      time.tick(10);
      relay.subscribe(msg.p[0].p.iris[0]);
      time.tick(10);
      builder.mockWebsocketInstance?.emit(
        "message",
        new MessageEvent<any>("message", {
          data: JSON.stringify(msg),
        })
      );
      time.tick(10);
      assertSpyCalls(postUpdateSpy, 1);
    } finally {
      postUpdateSpy.restore();
      newWebSocketStub.restore();
    }
  });

  it("Filters out non-matching 1.0 messages", () => {
    const builder: MockWebsocketStubBuilder = new MockWebsocketStubBuilder();
    const msg = mockLivewireMessage();

    newWebSocketStub = stub(
      relay,
      "newWebSocket",
      builder.build("ws://example.com", {
        openAfterAttempts: 1,
        openCurrentAttempt: 0,
        openGoSilentAfterAttempts: 1,
      })
    );
    const postUpdateSpy = spy(relay, "postUpdate");
    try {
      relay.connect();
      time.tick(10);
      relay.subscribe(`${msg.p[0].p.iris[0]}#doesnotmatch`);
      time.tick(10);
      builder.mockWebsocketInstance?.emit(
        "message",
        new MessageEvent<any>("message", {
          data: JSON.stringify(msg),
        })
      );
      time.tick(10);
      assertSpyCalls(postUpdateSpy, 0);
    } finally {
      postUpdateSpy.restore();
      newWebSocketStub.restore();
    }
  });
});
