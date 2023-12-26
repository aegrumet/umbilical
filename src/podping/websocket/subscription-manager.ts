import { PodpingFilter } from "../../interfaces/podping-filter.ts";

class SubscriptionManager implements PodpingFilter {
  public patterns: Array<RegExp>;

  constructor() {
    this.patterns = Array<RegExp>();
  }

  public addRssUrls(p: string[]) {
    this.deleteRssUrls(p); // de-dupe

    this.patterns.push(
      ...p.map((pattern) => new RegExp("^" + this.escapeRegExp(pattern) + "$"))
    );
  }

  public addRssUrlsRegExp(p: string[]) {
    this.deleteRssUrlsRegExp(p); // de-dupe

    this.patterns.push(...p.map((pattern) => new RegExp(pattern)));
  }

  /**
   * NB: this.escapeRegExp is not the inverse of pattern.source, so we have
   * to apply the forward transformation RegExp.source to both sides of the
   * comparison.
   */
  public deleteRssUrls(p: string[]) {
    const exclusionList = p.map(
      (pattern) => new RegExp("^" + this.escapeRegExp(pattern) + "$").source
    );
    this.patterns = this.patterns.filter((pattern) => {
      return !exclusionList.includes(pattern.source);
    });
  }

  public deleteRssUrlsRegExp(p: string[]) {
    const exclusionList = p.map((pattern) => new RegExp(pattern).source);
    this.patterns = this.patterns.filter((pattern) => {
      return !exclusionList.includes(pattern.source);
    });
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
  public escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }

  public test(str: string) {
    for (const pattern of this.patterns) {
      if (pattern.test(str)) {
        return true;
      }
    }
    return false;
  }
}

export default SubscriptionManager;
