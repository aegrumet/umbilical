import {
  PushSubscriptionSchema,
  RegisterPutInputSchema,
  RegisterDeleteInputSchema,
} from "../interfaces/pusher-api.ts";

import { PushSubscription } from "../../server_deps.ts";
import {
  RegisterDeleteInput,
  RegisterPutInput,
} from "../interfaces/pusher-api.ts";

// deno-lint-ignore no-explicit-any
export const isPushSubscription = (b: any): b is PushSubscription => {
  return PushSubscriptionSchema.safeParse(b).success;
};

// deno-lint-ignore no-explicit-any
export const isRegisterPutInput = (b: any): b is RegisterPutInput => {
  return RegisterPutInputSchema.safeParse(b).success;
};

// deno-lint-ignore no-explicit-any
export const isRegisterDeleteInput = (b: any): b is RegisterDeleteInput => {
  return RegisterDeleteInputSchema.safeParse(b).success;
};
