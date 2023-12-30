import { ENABLED_FEATURES_DEFAULT } from "./env-defaults.ts";
import { UmbilicalEnv } from "./interfaces/umbilical-context.ts";

const denoEnv = (): UmbilicalEnv => {
  return {
    UMBILICAL_KEYS: Deno.env.get("UMBILICAL_KEYS"),
    PI_API_KEY: Deno.env.get("PI_API_KEY"),
    PI_API_SECRET: Deno.env.get("PI_API_SECRET"),
    WEBPUSH_JWK_BASE64: Deno.env.get("WEBPUSH_JWK_BASE64"),
    WEBPUSH_CONTACT: Deno.env.get("WEBPUSH_CONTACT"),
    DEBUG: Deno.env.get("DEBUG") === "true",
    ENABLED_FEATURES:
      Deno.env.get("ENABLED_FEATURES") ?? ENABLED_FEATURES_DEFAULT,
  };
};

export default denoEnv;
