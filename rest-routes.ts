import { Hono, cors } from "./deps.ts";

import proxyRoutes from "./src/routes/proxy.ts";
import podcastIndexRoutes from "./src/routes/podcastIndex.ts";

const rest = new Hono();

rest.use("*", cors());
rest.route("/proxy", proxyRoutes);
rest.route("/pi", podcastIndexRoutes);

export default rest;
