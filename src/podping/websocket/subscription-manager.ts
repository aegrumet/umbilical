import { PodpingFilter } from "../../interfaces/podping-filter.ts";

class SubscriptionManager implements PodpingFilter {
  public patterns: Array<RegExp>;

  constructor() {
    this.patterns = Array<RegExp>();
  }

  public subscribe(p: string | string[]) {
    this.unsubscribe(p); // de-dupe
    if (Array.isArray(p)) {
      this.patterns.push(
        ...p.map(
          (pattern) => new RegExp("^" + this.escapeRegExp(pattern) + "$")
        )
      );
    } else {
      this.patterns.push(new RegExp("^" + this.escapeRegExp(p) + "$"));
    }
  }

  public subscribeRegExp(p: string | string[]) {
    this.unsubscribeRegExp(p); // de-dupe
    if (Array.isArray(p)) {
      this.patterns.push(...p.map((pattern) => new RegExp(pattern)));
    } else {
      this.patterns.push(new RegExp(p));
    }
  }

  /**
   * NB: this.escapeRegExp is not the inverse of pattern.source, so we have
   * to apply the forward transformation RegExp.source to both sides of the
   * comparison.
   */
  public unsubscribe(p: string | string[]) {
    if (Array.isArray(p)) {
      const exclusionList = p.map(
        (pattern) => new RegExp("^" + this.escapeRegExp(pattern) + "$").source
      );
      this.patterns = this.patterns.filter((pattern) => {
        return !exclusionList.includes(pattern.source);
      });
    } else {
      this.patterns = this.patterns.filter((pattern) => {
        return (
          pattern.source !== new RegExp("^" + this.escapeRegExp(p) + "$").source
        );
      });
    }
  }

  public unsubscribeRegExp(p: string | string[]) {
    if (Array.isArray(p)) {
      const exclusionList = p.map((pattern) => new RegExp(pattern).source);
      this.patterns = this.patterns.filter((pattern) => {
        return !exclusionList.includes(pattern.source);
      });
    } else {
      this.patterns = this.patterns.filter((pattern) => {
        return pattern.source !== new RegExp(p).source;
      });
    }
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
