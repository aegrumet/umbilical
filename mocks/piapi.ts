import { mf } from "../dev_deps.ts";

const TEST_PI_API_KEY = "test pi api key";
const TEST_PI_API_SECRET = "test pi api secret";
const PIAPI_PATH = "/api/1.0/search/byterm";

// Assume mf.install() has already been called
const installPiApiMock = () => {
  mf.mock(`GET@${PIAPI_PATH}`, (_req, _) => {
    if (
      (Deno.env.get("PI_API_KEY") ?? "") !== TEST_PI_API_KEY ||
      (Deno.env.get("PI_API_SECRET") ?? "") !== TEST_PI_API_SECRET
    ) {
      return new Response("[]", {
        status: 500,
      });
    }

    return new Response("[]", {
      status: 200,
    });
  });
};

// Assume that calling code will call mf.uninstall()
const uninstallPiApiMock = () => {
  mf.remove(`GET@${PIAPI_PATH}`);
};

export default installPiApiMock;

export {
  TEST_PI_API_KEY,
  TEST_PI_API_SECRET,
  installPiApiMock,
  uninstallPiApiMock,
};
