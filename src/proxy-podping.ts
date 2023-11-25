import { Context } from "../deps.ts";
import StatefulPodpingRelay from "./stateful-podping-relay.ts";

const relayPodping = (c: Context) => {
  const relay = new StatefulPodpingRelay();
  relay.connect();
  const podpingEmitter = relay.getEmitter();
  let shouldUnsubscribe = false;

  const { response, socket } = Deno.upgradeWebSocket(c.req.raw);
  socket.onclose = () => {
    shouldUnsubscribe = true;
  };

  socket.onopen = async () => {
    for await (const ping of podpingEmitter) {
      if (typeof ping === typeof Error) {
        console.log("websocket error", ping);
        break;
      }
      if (!shouldUnsubscribe) {
        socket.send(JSON.stringify(ping));
      } else {
        relay.close();
        break;
      }
    }
  };

  socket.onmessage = (event) => {
    if (event.data === "ping") {
      socket.send("pong");
      return;
    }
    try {
      const json = JSON.parse(event.data);
      if (json.subscribe) {
        relay.subscribe(json.subscribe);
      }
      if (json.unsubscribe) {
        relay.unsubscribe(json.unsubscribe);
      }
      if (json.subscribeRegExp) {
        relay.subscribeRegExp(json.subscribeRegExp);
      }
      if (json.unsubscribeRegExp) {
        relay.unsubscribeRegExp(json.unsubscribeRegExp);
      }
    } catch (_) {
      // do nothing
    }
  };

  return response;
};

export default relayPodping;
