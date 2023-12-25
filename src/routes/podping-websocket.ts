import { Context, Hono } from "../../deps.ts";
import { WebSocketProvider } from "../interfaces/websocket-provider.ts";
import SubscriptionManager from "../podping/websocket/subscription-manager.ts";
import PodpingWebsocketProxy from "../podping/websocket/podping-websocket-proxy.ts";
import PodpingRelayFiltered from "../podping/shared/podping-relay-filtered.ts";
import { PodpingFilter } from "../interfaces/podping-filter.ts";

function getWebsocketRoutes(websocketProvider: WebSocketProvider): Hono {
  const websocket = new Hono();

  websocket.get("/podping", (c: Context) => {
    const subscriptionManager: SubscriptionManager = new SubscriptionManager();
    const podpingRelayFiltered = new PodpingRelayFiltered(
      subscriptionManager as PodpingFilter
    );
    return new PodpingWebsocketProxy(
      subscriptionManager,
      podpingRelayFiltered
    ).proxy(c, websocketProvider);
  });

  return websocket;
}

export default getWebsocketRoutes;
