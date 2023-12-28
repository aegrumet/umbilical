import { PushSubscription } from "../../npm_deps.ts";
import { z } from "../../deps.ts";

export interface RegisterPutInput {
  readonly pushSubscription: PushSubscription;
  readonly rssUrls: string[];
}

export interface RegisterDeleteInput {
  readonly pushSubscription: PushSubscription;
}

export const PushSubscriptionSchema = z.object({
  endpoint: z.string(),
  keys: z.object({
    auth: z.string(),
    p256dh: z.string(),
  }),
});

export const RegisterPutInputSchema = z.object({
  pushSubscription: PushSubscriptionSchema,
  rssUrls: z.array(z.string()),
});

export const RegisterDeleteInputSchema = z.object({
  pushSubscription: PushSubscriptionSchema,
});
