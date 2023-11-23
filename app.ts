import { Hono } from "./deps.ts";
import { loadGenericRoutes } from "./load-generic-routes.ts";

const app = new Hono();
loadGenericRoutes(app);

export default app;
