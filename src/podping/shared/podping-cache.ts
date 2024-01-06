import { WeakLRUCache } from "../../../deps.ts";
import UmbilicalContext from "../../interfaces/umbilical-context.ts";

export default class PodpingCache {
  private static instance: PodpingCache;
  private cache: WeakLRUCache;

  private constructor() {
    this.cache = new WeakLRUCache();
  }

  public static getInstance(): PodpingCache {
    if (!PodpingCache.instance) {
      PodpingCache.instance = new PodpingCache();
    }

    return PodpingCache.instance;
  }

  public reset() {
    this.cache = new WeakLRUCache();
  }

  public shouldNotify(
    c: UmbilicalContext,
    iri: string,
    reason: string
  ): boolean {
    const key = `${iri}-${reason}`;
    const value: Date | undefined = this.cache.getValue(key);
    if (value === undefined) {
      return true;
    }
    if (
      Date.now() - value.getTime() >
      c.env.PODPING_TIMEOUT_MINUTES * 60 * 1000
    ) {
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
