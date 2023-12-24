import { PushSubscription } from "../../npm_deps.ts";
import {
  RegisterDeleteInput,
  RegisterPutInput,
} from "../interfaces/pusher-api.ts";

export const isPushSubscription = (b: any): b is PushSubscription => {
  return (
    b.endpoint !== undefined &&
    b.keys !== undefined &&
    b.keys.auth !== undefined &&
    b.keys.p256dh !== undefined
  );
};

export const isRegisterPutInput = (b: any): b is RegisterPutInput => {
  return (
    isPushSubscription(b.pushSubscription) &&
    (typeof b.rssUrls === "string" || Array.isArray(b.rssUrls))
  );
};

export const isRegisterDeleteInput = (b: any): b is RegisterDeleteInput => {
  return "pushSubscription" in b && isPushSubscription(b.pushSubscription);
};
