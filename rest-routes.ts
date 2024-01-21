import { Hono, cors } from "./deps.ts";

import proxyRoutes from "./src/routes/proxy.ts";
import searchRoutes from "./src/routes/search.ts";
import podrollRoutes from "./src/routes/podroll.ts";
import oauth2Routes from "./src/routes/oauth2.ts";

const rest = new Hono();

rest.use("*", cors());
rest.route("/proxy", proxyRoutes);
rest.route("/search", searchRoutes);
rest.route("/podroll", podrollRoutes);
rest.route("/oauth2", oauth2Routes);
export default rest;
