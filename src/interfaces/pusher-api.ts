export interface RegisterPutInput {
  readonly pushSubscription: PushSubscription;
  readonly rssUrls: string | string[];
}

export interface RegisterDeleteInput {
  readonly pushSubscription: PushSubscription;
}