import { Context, Evt } from "../../../deps.ts";
import StatefulPodpingRelay from "../../podping/websocket/stateful-podping-relay.ts";
import { WebSocketProvider } from "../../interfaces/websocket-provider.ts";
import {
  PodpingV0,
  PodpingV1,
} from "../../interfaces/livewire-podping-websocket.ts";

const HEARTBEAT_INTERVAL = 1000 * 30;

class ProxyPodpingHandler {
  shouldUnsubscribe = false;
  podpingEmitter: Evt<PodpingV0 | PodpingV1 | Error>;
  relay: StatefulPodpingRelay;
  isAlive = false;
  interval: number | undefined;

  constructor() {
    this.relay = new StatefulPodpingRelay();
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
        if (json.subscribe) {
          this.relay.subscribe(json.subscribe);
        }
        if (json.unsubscribe) {
          this.relay.unsubscribe(json.unsubscribe);
        }
        if (json.subscribeRegExp) {
          this.relay.subscribeRegExp(json.subscribeRegExp);
        }
        if (json.unsubscribeRegExp) {
          this.relay.unsubscribeRegExp(json.unsubscribeRegExp);
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

  listen = async (socket: WebSocket, relay: StatefulPodpingRelay) => {
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

export default ProxyPodpingHandler;
