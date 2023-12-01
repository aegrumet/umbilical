import { Context, Evt } from "../deps.ts";
import StatefulPodpingRelay from "./stateful-podping-relay.ts";
import { WebSocketProvider } from "./interfaces/websocket-provider.ts";
import {
  PodpingV0,
  PodpingV1,
} from "./interfaces/livewire-podping-websocket.ts";

class ProxyPodpingHandler {
  shouldUnsubscribe = false;
  podpingEmitter: Evt<PodpingV0 | PodpingV1 | Error>;
  relay: StatefulPodpingRelay;

  constructor() {
    this.relay = new StatefulPodpingRelay();
    this.relay.connect();
    this.podpingEmitter = this.relay.getEmitter();
  }

  proxy(c: Context, p: WebSocketProvider) {
    this.shouldUnsubscribe = false;

    const { response, socket } = p.upgradeWebSocket(c);

    if (socket === null) {
      return response;
    }

    socket.addEventListener("close", () => {
      this.shouldUnsubscribe = true;
    });

    // deno-lint-ignore no-explicit-any
    socket.addEventListener("message", (event: any) => {
      if (event.data === "ping") {
        socket.send("pong");
        return;
      }
      try {
        const json = JSON.parse(event.data);
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
