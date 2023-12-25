import { Hono, cors } from "./deps.ts";

import proxyRoutes from "./src/routes/proxy.ts";
import searchRoutes from "./src/routes/search.ts";
import podpingWebpushRoutes from "./src/routes/podping-webpush.ts";

const rest = new Hono();

rest.use("/*", cors());
rest.route("/proxy", proxyRoutes);
rest.route("/search", searchRoutes);
rest.route("/podping-webpush", podpingWebpushRoutes);

export default rest;
