import {
  ENABLED_FEATURES_DEFAULT,
  WEBPUSH_THROTTLE_MINUTES_DEFAULT,
  WEBPUSH_TEMPLATE_DEFAULT,
  OTEL_EXPORTER_OTLP_ENDPOINT,
} from "./env-defaults.ts";
import { UmbilicalEnv } from "./interfaces/umbilical-context.ts";

const denoEnv = (): UmbilicalEnv => {
  return {
    UMBILICAL_KEYS: Deno.env.get("UMBILICAL_KEYS"),
    PI_API_KEY: Deno.env.get("PI_API_KEY"),
    PI_API_SECRET: Deno.env.get("PI_API_SECRET"),
    WEBPUSH_JWK_BASE64: Deno.env.get("WEBPUSH_JWK_BASE64"),
    WEBPUSH_CONTACT: Deno.env.get("WEBPUSH_CONTACT"),
    WEBPUSH_TEMPLATE:
      Deno.env.get("WEBPUSH_TEMPLATE") ?? WEBPUSH_TEMPLATE_DEFAULT,
    DEBUG: Deno.env.get("DEBUG") === "true",
    ENABLED_FEATURES:
      Deno.env.get("ENABLED_FEATURES") ?? ENABLED_FEATURES_DEFAULT,
    WEBPUSH_THROTTLE_MINUTES:
      Deno.env.get("WEBPUSH_THROTTLE_MINUTES") ??
      WEBPUSH_THROTTLE_MINUTES_DEFAULT,
    OTEL_EXPORTER_OTLP_ENDPOINT:
      Deno.env.get("OTEL_EXPORTER_OTLP_ENDPOINT") ??
      OTEL_EXPORTER_OTLP_ENDPOINT,
  };
};

export default denoEnv;
