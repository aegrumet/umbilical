export type UmbilicalEnv = {
  UMBILICAL_KEYS: string | undefined;
  PI_API_KEY: string | undefined;
  PI_API_SECRET: string | undefined;
  DEBUG: boolean | undefined;
};

export type UmbilicalContext = {
  req: {
    url: string;
    header: (key: string) => string | undefined;
  };
  env: UmbilicalEnv;
};

export default UmbilicalContext;
