export type { PushSubscription } from "npm:@types/web-push@3.6.3";
export { gitDescribeSync } from "npm:git-describe@4.1.1";
export type { GitInfo } from "npm:git-describe@4.1.1";

// Deps that don't play well with cloudflare
export { Eta } from "https://deno.land/x/eta@v3.2.0/src/index.ts";
export { existsSync } from "https://deno.land/std@0.212.0/fs/mod.ts";
export {
  CookieStore,
  MemoryStore,
  Session,
  sessionMiddleware,
} from "https://deno.land/x/hono_sessions@v0.3.3/mod.ts";

import opentelemetry from "npm:@opentelemetry/api@1.8.0";
export { opentelemetry };
export { Resource } from "npm:@opentelemetry/resources";
export {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from "npm:@opentelemetry/sdk-metrics";
// grpc doesn't seem to work with Deno
export { OTLPMetricExporter } from "npm:@opentelemetry/exporter-metrics-otlp-http";
