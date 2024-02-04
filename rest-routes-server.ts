import { Hono, cors } from "./deps.ts";

import podpingWebpushRoutes from "./src/routes/podping-webpush.ts";
import oauth2Routes from "./src/routes/oauth2.ts";

const restServer = new Hono();

restServer.use("*", cors());
restServer.route("/podping-webpush", podpingWebpushRoutes);
restServer.route("/oauth2", oauth2Routes);

export default restServer;
