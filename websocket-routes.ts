import { Context, Hono } from "./deps.ts";
import relayPodping from "./src/relay-podping.ts";
import UmbilicalContext from "./src/umbilical-context.ts";
import verify from "./src/verify.ts";

const websocket = new Hono();

websocket.get("/podping", (c: Context) => {
  if (!verify(c as UmbilicalContext)) {
    c.status(401);
    return c.text("Unauthorized.");
  }
  return relayPodping(c);
});

export default websocket;
