import { UmbilicalEnv } from "./interfaces/umbilical-context.ts";

const denoEnv = (): UmbilicalEnv => {
  return {
    UMBILICAL_KEYS: Deno.env.get("UMBILICAL_KEYS"),
    PI_API_KEY: Deno.env.get("PI_API_KEY"),
    PI_API_SECRET: Deno.env.get("PI_API_SECRET"),
    DEBUG: Deno.env.get("DEBUG") === "true",
  };
};

export default denoEnv;
