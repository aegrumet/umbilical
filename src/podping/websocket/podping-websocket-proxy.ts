import { Context, Evt } from "../../../deps.ts";
import { WebSocketProvider } from "../../interfaces/websocket-provider.ts";
import {
  PodpingV0,
  PodpingV1,
} from "../../interfaces/livewire-podping-websocket.ts";
import SubscriptionManager from "./subscription-manager.ts";
import PodpingRelayFiltered from "../shared/podping-relay-filtered.ts";

const HEARTBEAT_INTERVAL = 1000 * 30;

class PodpingWebsocketProxy {
  shouldUnsubscribe = false;
  podpingEmitter: Evt<PodpingV0 | PodpingV1 | Error>;
  isAlive = false;
  interval: number | undefined;
  subscriptionManager: SubscriptionManager;
  relay: PodpingRelayFiltered;

  constructor(
    subscriptionManager: SubscriptionManager,
    podpingRelayFiltered: PodpingRelayFiltered
  ) {
    this.subscriptionManager = subscriptionManager;
    this.relay = podpingRelayFiltered;
    this.relay.connect();
    this.podpingEmitter = this.relay.getEmitter();
  }

  ping(ws: WebSocket) {
    ws.send(JSON.stringify({ ping: 1 }));
  }

  proxy(c: Context, p: WebSocketProvider) {
    this.shouldUnsubscribe = false;

    const { response, socket } = p.upgradeWebSocket(c);

    if (socket === null) {
      return response;
    }

    this.isAlive = true;

    socket.addEventListener("close", () => {
      this.shouldUnsubscribe = true;
      clearInterval(this.interval);
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
      } catch (_) {
        // do nothing
      }
    });

    this.listen(socket, this.relay);

    this.interval = setInterval(() => {
      if (!this.isAlive) {
        socket.close();
        return;
      }
      this.isAlive = false;
      this.ping(socket);
    }, HEARTBEAT_INTERVAL);

    return response;
  }

  listen = async (socket: WebSocket, relay: PodpingRelayFiltered) => {
    for await (const ping of this.podpingEmitter) {
      if (typeof ping === typeof Error) {
        console.log("websocket error", ping);
        break;
      }
      if (!this.shouldUnsubscribe) {
        socket.send(JSON.stringify(ping));
      } else {
        break;
      }
    }
    relay.close();
    socket.close();
  };
}

export default PodpingWebsocketProxy;
