import { Hono, cors } from "./deps.ts";

import proxyRoutes from "./src/routes/proxy.ts";
import searchRoutes from "./src/routes/search.ts";
import notificationsRoutes from "./src/routes/notifications.ts";

const rest = new Hono();

rest.use("/*", cors());
rest.route("/proxy", proxyRoutes);
rest.route("/search", searchRoutes);
rest.route("/notifications", notificationsRoutes);

export default rest;
