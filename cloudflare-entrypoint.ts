import { Hono } from "./deps.ts";
import rest from "./rest-routes.ts";

const app = new Hono();

app.route("/API", rest);

export default app;
