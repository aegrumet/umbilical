import { Hono } from "./deps.ts";

import podpingWebpushRoutes from "./src/routes/podping-webpush.ts";

const restServer = new Hono();

restServer.route("/podping-webpush", podpingWebpushRoutes);

export default restServer;
