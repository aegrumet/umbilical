import {
  describe,
  it,
  beforeEach,
  FakeTime,
  stub,
  assertSpyCalls,
  spy,
  Stub,
  afterEach,
} from "../../../dev_deps.ts";
import MockWebsocketStubBuilder from "../../../mocks/websocket.ts";
import PodpingRelay, { MAX_CONNECT_ATTEMPTS } from "./podping-relay.ts";
import { mockLivewireMessage } from "../../../mocks/livewire-podping.ts";
import { NullTelemetry } from "../../telemetry/null-telemetry.ts";

describe("Filtered podping relay", () => {
  let time: FakeTime;
  let relay: PodpingRelay;
  let newWebSocketStub: Stub;

  const livewireMessage = mockLivewireMessage();

  beforeEach(() => {
    time = new FakeTime();
    relay = PodpingRelay.getInstance(new NullTelemetry(), true);
  });

  afterEach(() => {
    relay.shutdown();
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

  it("Passes 1.0 messages", () => {
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
        new MessageEvent<string>("message", {
          data: JSON.stringify(livewireMessage),
        })
      );
      time.tick(10);
      assertSpyCalls(postUpdateSpy, 1);
    } finally {
      postUpdateSpy.restore();
      newWebSocketStub.restore();
    }
  });
});
