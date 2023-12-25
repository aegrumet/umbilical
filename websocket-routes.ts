import { Context } from "./deps.ts";
import { WebSocketProvider } from "./src/interfaces/websocket-provider.ts";
import getWebsocketRoutes from "./src/routes/podping-websocket.ts";

class DenoWebSocketProvider implements WebSocketProvider {
  public upgradeWebSocket(c: Context) {
    const { response, socket } = Deno.upgradeWebSocket(c.req.raw);
    return {
      response,
      socket,
    };
  }
}

const websocket = getWebsocketRoutes(new DenoWebSocketProvider());

export default websocket;
