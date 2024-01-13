import {
  describe,
  it,
  afterAll,
  beforeAll,
  assertEquals,
} from "../dev_deps.ts";
import denoEnv from "./deno-env.ts";
import {
  ENABLED_FEATURES_DEFAULT,
  WEBPUSH_THROTTLE_MINUTES_DEFAULT,
} from "./env-defaults.ts";

describe("denoEnv", () => {
  beforeAll(() => {});

  afterAll(() => {});

  it("sets ENABLED_FEATURES to the default value if ENABLED_FEATURES is not set in the environment.", () => {
    const env = denoEnv();
    assertEquals(env.ENABLED_FEATURES, ENABLED_FEATURES_DEFAULT);
  });

  it("sets WEBPUSH_THROTTLE_MINUTES to the default value if WEBPUSH_THROTTLE_MINUTES is not set in the environment.", () => {
    const env = denoEnv();
    assertEquals(
      env.WEBPUSH_THROTTLE_MINUTES,
      WEBPUSH_THROTTLE_MINUTES_DEFAULT
    );
  });

  it("sets WEBPUSH_THROTTLE_MINUTES to the environment value.", () => {
    const value = "120";
    Deno.env.set("WEBPUSH_THROTTLE_MINUTES", value);
    const env = denoEnv();
    assertEquals(env.WEBPUSH_THROTTLE_MINUTES, value);
    Deno.env.delete("WEBPUSH_THROTTLE_MINUTES");
  });
});
