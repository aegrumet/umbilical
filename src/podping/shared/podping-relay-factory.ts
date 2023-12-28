// Deno doesn't support stubbing for class methods. If we want to support
// testing we're gonna have to use a factory :-/

import PodpingRelay from "./podping-relay.ts";

export default class PodpingRelayFactory {
  private static instance: PodpingRelayFactory;

  private constructor() {}

  public static getInstance(): PodpingRelayFactory {
    if (!PodpingRelayFactory.instance) {
      PodpingRelayFactory.instance = new PodpingRelayFactory();
    }

    return PodpingRelayFactory.instance;
  }
  public getPodpingRelay(): PodpingRelay {
    return PodpingRelay.getInstance();
  }
}
