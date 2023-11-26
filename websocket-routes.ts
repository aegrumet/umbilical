import { Context, Hono } from "./deps.ts";
import proxyPodping from "./src/proxy-podping.ts";

const websocket = new Hono();

websocket.get("/podping", (c: Context) => {
  return proxyPodping(c);
});

export default websocket;
