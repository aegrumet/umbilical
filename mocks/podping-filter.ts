import { PodpingFilter } from "../src/interfaces/podping-filter.ts";

class MockPodpingFilter implements PodpingFilter {
  matchList: string[] = [];

  public constructor(matchList: string[] = []) {
    this.matchList = matchList;
  }

  public test(str: string): boolean {
    return this.matchList.includes(str);
  }
}

export default MockPodpingFilter;
