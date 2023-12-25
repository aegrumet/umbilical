import { Hono, cors } from "./deps.ts";

import podpingWebpushRoutes from "./src/routes/podping-webpush.ts";

const restServer = new Hono();

restServer.use("/*", cors());
restServer.route("/podping-webpush", podpingWebpushRoutes);

export default restServer;
