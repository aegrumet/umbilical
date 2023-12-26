import { PushSubscription } from "../../npm_deps.ts";

export interface RegisterPutInput {
  readonly pushSubscription: PushSubscription;
  readonly rssUrls: string[];
}

export interface RegisterDeleteInput {
  readonly pushSubscription: PushSubscription;
}
