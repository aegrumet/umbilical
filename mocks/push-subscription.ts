import { randomString } from "./utils.ts";
import { PushSubscription } from "../server_deps.ts";

export const validPushSubscription = {
  endpoint: "https://example.com",
  keys: {
    auth: randomString(22),
    p256dh: randomString(87),
  },
} as unknown as PushSubscription;

export const invalidPushSubscription = {
  endpoint: "https://example.com",
};

export const validRegisterPutInput = {
  pushSubscription: {
    endpoint: "https://example.com",
    keys: {
      auth: randomString(22),
      p256dh: randomString(87),
    },
  },
  rssUrls: ["https://example.com"],
};

export const invalidRegisterPutInput = {
  pushSubscription: invalidPushSubscription,
  rssUrls: ["https://example.com"],
};

export const validRegisterDeleteInput = {
  pushSubscription: validPushSubscription,
};

export const invalidRegisterDeleteInput = {
  notAPushSubscription: validPushSubscription,
};
