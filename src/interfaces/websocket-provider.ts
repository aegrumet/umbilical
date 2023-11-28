import { Context } from "../../deps.ts";

export interface WebSocketProvider {
  upgradeWebSocket: (c: Context) => {
    response: Response;
    socket: WebSocket | null;
  };
}
