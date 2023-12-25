import { Hono, cors } from "./deps.ts";

import proxyRoutes from "./src/routes/proxy.ts";
import searchRoutes from "./src/routes/search.ts";

const rest = new Hono();

rest.use("/*", cors());
rest.route("/proxy", proxyRoutes);
rest.route("/search", searchRoutes);

export default rest;
