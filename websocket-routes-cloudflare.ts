import { Context } from "./deps.ts";
import { WebSocketProvider } from "./src/interfaces/websocket-provider.ts";
import getWebsocketRoutes from "./src/routes/podping-websocket.ts";

// https://github.com/cloudflare/workers-types/issues/84
declare global {
  interface CloudflareWebsocket {
    accept(): unknown;
    addEventListener(
      event: "close",
      callbackFunction: (code?: number, reason?: string) => unknown
    ): unknown;
    addEventListener(
      event: "error",
      callbackFunction: (e: unknown) => unknown
    ): unknown;
    addEventListener(
      event: "message",
      callbackFunction: (event: { data: any }) => unknown
    ): unknown;

    /**
     * @param code https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
     * @param reason
     */
    close(code?: number, reason?: string): unknown;
    send(message: string | Uint8Array): unknown;
  }

  class WebSocketPair {
    0: CloudflareWebsocket; // Client
    1: CloudflareWebsocket; // Server
  }

  interface ResponseInit {
    webSocket?: CloudflareWebsocket;
  }
}

class CloudflareWebSocketProvider implements WebSocketProvider {
  public upgradeWebSocket(c: Context) {
    let response: Response;
    let server: CloudflareWebsocket | null;
    let client: CloudflareWebsocket;

    const upgradeHeader = c.req.header("Upgrade");
    if (!upgradeHeader || upgradeHeader !== "websocket") {
      response = new Response("Expected Upgrade: websocket", { status: 426 });
      server = null;
    } else {
      const webSocketPair = new WebSocketPair();
      [client, server] = Object.values(webSocketPair);
      server!.accept();

      response = new Response(null, {
        status: 101,
        webSocket: client,
      });
    }
    return {
      response,
      socket: server as unknown as WebSocket | null,
    };
  }
}

const websocket = getWebsocketRoutes(new CloudflareWebSocketProvider());

export default websocket;
