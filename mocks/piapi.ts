const TEST_PI_API_KEY = "test pi api key";
const TEST_PI_API_SECRET = "test pi api secret";

const piapi = (key: string | undefined, secret: string | undefined) => {
  if (key !== TEST_PI_API_KEY || secret !== TEST_PI_API_SECRET) {
    throw new Error("Invalid API key or secret");
  }
  return {
    searchByTerm: (_: string) => {
      return new Promise((resolve, _) => {
        resolve({
          status: true,
          feeds: [],
        });
      });
    },
  };
};

export default piapi;
export { TEST_PI_API_KEY, TEST_PI_API_SECRET };
