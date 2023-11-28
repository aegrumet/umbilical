import { Context, Hono } from "./deps.ts";
import { WebSocketProvider } from "./src/interfaces/websocket-provider.ts";
import ProxyPodpingHandler from "./src/proxy-podping.ts";

class DenoWebSocketProvider implements WebSocketProvider {
  public upgradeWebSocket(c: Context) {
    const { response, socket } = Deno.upgradeWebSocket(c.req.raw);
    return {
      response,
      socket,
    };
  }
}

const websocket = new Hono();

websocket.get("/podping", (c: Context) => {
  return new ProxyPodpingHandler().proxy(c, new DenoWebSocketProvider());
});

export default websocket;
