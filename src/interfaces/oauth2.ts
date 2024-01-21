import { z } from "../../deps.ts";

export const OauthClientConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  authorizationEndpointUri: z.string(),
  tokenUri: z.string(),
  redirectUri: z.string(),
  defaults: z.object({
    scope: z.string(),
  }),
});

export type OauthClientConfig = z.infer<typeof OauthClientConfigSchema>;

export const OauthClientKeySchema = z.string().min(1).max(32);

export type OauthClientKey = z.infer<typeof OauthClientKeySchema>;

export const OauthConfigSchema = z.object({
  pwaRedirectUris: z.array(z.string()),
  clients: z.record(OauthClientKeySchema, OauthClientConfigSchema),
});

export type OauthConfig = z.infer<typeof OauthConfigSchema>;
