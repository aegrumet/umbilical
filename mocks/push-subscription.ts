import { randomString } from "./utils.ts";
import { PushSubscription } from "../deps.ts";

export const validPushSubscription = {
  endpoint: "https://example.com",
  keys: {
    auth: randomString(22),
    p256dh: randomString(87),
  },
} as unknown as PushSubscription;

export const validRegisterPutArg = {
  pushSubscription: {
    endpoint: "https://example.com",
    keys: {
      auth: randomString(22),
      p256dh: randomString(87),
    },
  },
  rssUrls: ["https://example.com"],
};

export const invalidRegisterPutArg = {
  pushSubscription: {
    endpoint: "https://example.com",
  },
  rssUrls: ["https://example.com"],
};
