import { WeakLRUCache } from "../../../deps.ts";

export default class PodpingCache {
  private static instance: PodpingCache;
  private cache: WeakLRUCache;
  private timeoutMinutes: number;

  private constructor(timeoutMinutes: number) {
    this.cache = new WeakLRUCache();
    this.timeoutMinutes = timeoutMinutes;
  }

  public static getInstance(timeoutMinutes: number): PodpingCache {
    if (!PodpingCache.instance) {
      PodpingCache.instance = new PodpingCache(timeoutMinutes);
    }

    return PodpingCache.instance;
  }

  public reset() {
    this.cache = new WeakLRUCache();
  }

  public shouldNotify(iri: string, reason: string): boolean {
    const key = `${iri}-${reason}`;
    const value: Date | undefined = this.cache.getValue(key);
    if (value === undefined) {
      return true;
    }
    if (Date.now() - value.getTime() > this.timeoutMinutes * 60 * 1000) {
      return true;
    } else {
      return false;
    }
  }

  public markNotified(iri: string, reason: string) {
    this.markNotifiedWithDate(iri, reason, new Date());
  }

  // Broken out separately for testing.
  public markNotifiedWithDate(iri: string, reason: string, date: Date) {
    const key = `${iri}-${reason}`;
    this.cache.setValue(key, date);
  }
}
