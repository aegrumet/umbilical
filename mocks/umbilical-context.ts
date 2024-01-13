import UmbilicalContext from "../src/interfaces/umbilical-context.ts";

export const MockUmbilicalContext = {
  env: { WEBPUSH_THROTTLE_MINUTES: "60" },
} as UmbilicalContext;
