export type UmbilicalEnv = {
  UMBILICAL_KEYS: string | undefined;
  PI_API_KEY: string | undefined;
  PI_API_SECRET: string | undefined;
  WEBPUSH_JWK_BASE64: string | undefined;
  WEBPUSH_CONTACT: string | undefined;
  PODPING_TIMEOUT_MINUTES: number;
  DEBUG: boolean | undefined;
  ENABLED_FEATURES: string;
};

export type UmbilicalContext = {
  req: {
    url: string;
    header: (key: string) => string | undefined;
  };
  env: UmbilicalEnv;
};

export default UmbilicalContext;
