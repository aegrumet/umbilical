import { Context, Hono } from "../../deps.ts";
import { WebSocketProvider } from "../interfaces/websocket-provider.ts";
import SubscriptionManager from "../podping/websocket/subscription-manager.ts";
import PodpingWebsocketProxy from "../podping/websocket/podping-websocket-proxy.ts";
import PodpingRelayFiltered from "../podping/shared/podping-relay-filtered.ts";
import { PodpingFilter } from "../interfaces/podping-filter.ts";
import { authenticateWebsocket, gateFeature } from "./middleware.ts";

function getWebsocketRoutes(websocketProvider: WebSocketProvider): Hono {
  const routes = new Hono();
  routes.use("*", authenticateWebsocket);
  routes.use("*", gateFeature("podping_websocket"));

  routes.get("/podping", (c: Context) => {
    const subscriptionManager: SubscriptionManager = new SubscriptionManager();
    const podpingRelayFiltered = new PodpingRelayFiltered(
      subscriptionManager as PodpingFilter,
      c.get("telemetry")
    );
    return new PodpingWebsocketProxy(
      subscriptionManager,
      podpingRelayFiltered
    ).proxy(c, websocketProvider);
  });

  return routes;
}

export default getWebsocketRoutes;
