export type { PushSubscription } from "npm:@types/web-push@3.6.3";
export { gitDescribeSync } from "npm:git-describe@4.1.1";
export type { GitInfo } from "npm:git-describe@4.1.1";

// Deps that don't play well with cloudflare
export { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
export { existsSync } from "https://deno.land/std@0.224.0/fs/mod.ts";
export {
  CookieStore,
  MemoryStore,
  Session,
  sessionMiddleware,
} from "https://deno.land/x/hono_sessions@v0.5.8/mod.ts";

import opentelemetry from "npm:@opentelemetry/api@1.8.0";
export { opentelemetry };
export { Resource } from "npm:@opentelemetry/resources@1.24.1";
export {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from "npm:@opentelemetry/sdk-metrics@1.24.1";
// grpc doesn't seem to work with Deno
export { OTLPMetricExporter } from "npm:@opentelemetry/exporter-metrics-otlp-http@0.51.1";
