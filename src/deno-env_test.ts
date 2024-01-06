import {
  describe,
  it,
  afterAll,
  beforeAll,
  assertEquals,
  mf,
} from "../dev_deps.ts";
import denoEnv from "./deno-env.ts";
import {
  ENABLED_FEATURES_DEFAULT,
  PODPING_TIMEOUT_MINUTES_DEFAULT,
} from "./env-defaults.ts";

describe("denoEnv", () => {
  beforeAll(() => {});

  afterAll(() => {});

  it("sets ENABLED_FEATURES to the default value if ENABLED_FEATURES is not set in the environment.", () => {
    const env = denoEnv();
    assertEquals(env.ENABLED_FEATURES, ENABLED_FEATURES_DEFAULT);
  });

  it("sets PODPING_TIMEOUT_MINUTES to the default value if PODPING_TIMEOUT_MINUTES is not set in the environment.", () => {
    const env = denoEnv();
    assertEquals(env.PODPING_TIMEOUT_MINUTES, PODPING_TIMEOUT_MINUTES_DEFAULT);
  });

  it("sets PODPING_TIMEOUT_MINUTES to the environment value.", () => {
    const value = 120;
    Deno.env.set("PODPING_TIMEOUT_MINUTES", value.toString());
    const env = denoEnv();
    assertEquals(env.PODPING_TIMEOUT_MINUTES, value);
    Deno.env.delete("PODPING_TIMEOUT_MINUTES");
  });
});
