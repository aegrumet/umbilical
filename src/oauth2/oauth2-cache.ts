import { WeakLRUCache } from "../../deps.ts";

export default class Oauth2Cache {
  private static instance: Oauth2Cache;
  private cache: WeakLRUCache;

  private constructor() {
    this.cache = new WeakLRUCache();
  }

  public static getInstance(): Oauth2Cache {
    if (!Oauth2Cache.instance) {
      Oauth2Cache.instance = new Oauth2Cache();
    }

    return Oauth2Cache.instance;
  }

  public reset() {
    this.cache = new WeakLRUCache();
  }

  public getValue(key: string) {
    return this.cache.getValue(key);
  }

  // deno-lint-ignore no-explicit-any
  public setValue(key: string, value: any) {
    this.cache.setValue(key, value);
  }

  public delete(key: string) {
    this.cache.delete(key);
  }
}
