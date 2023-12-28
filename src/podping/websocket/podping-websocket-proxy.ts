import { Context, Evt, Ctx } from "../../../deps.ts";
import { WebSocketProvider } from "../../interfaces/websocket-provider.ts";
import {
  PodpingV0,
  PodpingV1,
} from "../../interfaces/livewire-podping-websocket.ts";
import SubscriptionManager from "./subscription-manager.ts";
import PodpingRelayFiltered from "../shared/podping-relay-filtered.ts";

const HEARTBEAT_INTERVAL = 1000 * 30;

class PodpingWebsocketProxy {
  private shouldUnsubscribe = false;
  private podpingEmitter: Evt<PodpingV0 | PodpingV1 | Error>;
  private isAlive = false;
  private interval: number | undefined;
  private subscriptionManager: SubscriptionManager;
  private relay: PodpingRelayFiltered;
  private podpingEmitterCtx: Ctx;
  private debug = false;
  private uuid: string | undefined;

  constructor(
    subscriptionManager: SubscriptionManager,
    podpingRelayFiltered: PodpingRelayFiltered
  ) {
    this.subscriptionManager = subscriptionManager;
    this.relay = podpingRelayFiltered;
    this.relay.connect();
    this.podpingEmitter = this.relay.getEmitter();
    this.podpingEmitterCtx = Evt.newCtx();
    this.uuid = crypto.randomUUID();
  }

  ping(ws: WebSocket) {
    ws.send(JSON.stringify({ ping: 1 }));
  }

  proxy(c: Context, p: WebSocketProvider) {
    this.debug = c.env.DEBUG;
    this.shouldUnsubscribe = false;

    const { response, socket } = p.upgradeWebSocket(c);

    if (socket === null) {
      return response;
    }

    this.isAlive = true;

    socket.addEventListener("close", () => {
      if (c.env.DEBUG) {
        console.log("Podping Websocket: close message handler");
      }
      this.shouldUnsubscribe = true;
      this.shutdown(socket, this.relay);
    });

    // deno-lint-ignore no-explicit-any
    socket.addEventListener("message", (event: any) => {
      try {
        const json = JSON.parse(event.data);
        if (json.pong) {
          this.isAlive = true;
        }
        if (json.addRssUrls) {
          this.subscriptionManager.addRssUrls(json.addRssUrls);
          if (c.env.DEBUG) {
            console.log(
              `Podping Websocket: subscribed to ${this.subscriptionManager.patterns.length} rssUrls`
            );
          }
        }
        if (json.deleteRssUrls) {
          this.subscriptionManager.deleteRssUrls(json.deleteRssUrls);
        }
        if (json.addRssUrlsRegExp) {
          this.subscriptionManager.addRssUrlsRegExp(json.addRssUrlsRegExp);
        }
        if (json.deleteRssUrlsRegExp) {
          this.subscriptionManager.deleteRssUrlsRegExp(
            json.deleteRssUrlsRegExp
          );
        }
        if (json.inject) {
          this.relay.inject(json.inject);
        }
      } catch (e) {
        if (c.env.DEBUG) {
          console.log("Podping Websocket message loop error", e);
        }
      }
    });

    this.listen(socket, this.relay);

    this.interval = setInterval(() => {
      if (!this.isAlive) {
        if (c.env.DEBUG) {
          console.log("Client failed to respond to ping, closing socket");
        }
        socket.close();
        return;
      }
      this.isAlive = false;
      this.ping(socket);
    }, HEARTBEAT_INTERVAL);

    return response;
  }

  async listen(socket: WebSocket, relay: PodpingRelayFiltered) {
    for await (const podping of this.podpingEmitter.iter(
      this.podpingEmitterCtx
    )) {
      if (typeof podping === typeof Error) {
        console.log("websocket error", podping);
        break;
      }
      if (!this.shouldUnsubscribe) {
        socket.send(JSON.stringify(podping));
      } else {
        break;
      }
    }
    this.shutdown(socket, relay);
  }

  // Close connections and stop processing.
  shutdown(socket: WebSocket, relay: PodpingRelayFiltered) {
    if (this.debug) {
      console.log("Podping Websocket: shutting down");
    }
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    try {
      relay.shutdown();
    } catch (_) {
      // do nothing
    }
    try {
      socket.readyState !== WebSocket.CLOSED;
      socket.close();
    } catch (_) {
      // do nothing
    }
    this.podpingEmitterCtx.done();
  }
}

export default PodpingWebsocketProxy;
