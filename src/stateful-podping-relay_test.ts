import { Stub, spy } from "https://deno.land/std@0.207.0/testing/mock.ts";
import {
  describe,
  it,
  beforeEach,
  FakeTime,
  stub,
  assertSpyCall,
} from "../dev_deps.ts";
import MockWebsocketStubBuilder from "../mocks/websocket.ts";
import StatefulPodpingRelay, {
  MAX_CONNECT_ATTEMPTS,
} from "./stateful-podping-relay.ts";

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
        openMaxAttempts: 1,
      })
    );
    const onopenSpy = spy(relay, "handleOpen");
    try {
      relay.connect();
      time.tick(10);
      assertSpyCall(onopenSpy, 0);
    } finally {
      onopenSpy.restore();
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
        openMaxAttempts: 2,
      })
    );
    const connectSpy = spy(relay, "connect");
    try {
      relay.connect();
      time.tick(1000000);
      assertSpyCall(connectSpy, 1);
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
        openMaxAttempts: MAX_CONNECT_ATTEMPTS + 3,
      })
    );
    const connectSpy = spy(relay, "connect");
    try {
      relay.connect();
      time.tick(1000000); // Make sure this is large enough to exceed the exponential backoff
      assertSpyCall(connectSpy, MAX_CONNECT_ATTEMPTS - 1);
    } finally {
      connectSpy.restore();
      newWebSocketStub.restore();
    }
  });
});
