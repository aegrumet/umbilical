import { Evt } from "../../../deps.ts";
import {
  PodpingV0,
  PodpingV1,
} from "../../interfaces/livewire-podping-websocket.ts";
import { PodpingFilter } from "../../interfaces/podping-filter.ts";
import PodpingRelay from "./podping-relay.ts";
import PodpingRelayFactory from "./podping-relay-factory.ts";

export default class PodpingRelayFiltered {
  private relay: PodpingRelay;
  private relayEmitter: Evt<PodpingV0 | PodpingV1 | Error>;
  private filterEmitter: Evt<PodpingV0 | PodpingV1 | Error>;
  private podpingFilter: PodpingFilter;
  private uuid: string | undefined;
  private logInterval: number | undefined;

  podpingCount = 0;
  emittedCount = 0;

  constructor(podpingFilter: PodpingFilter) {
    this.relay = PodpingRelayFactory.getInstance().getPodpingRelay();
    this.relayEmitter = this.relay.getEmitter();
    this.podpingFilter = podpingFilter;
    this.filterEmitter = Evt.create<PodpingV0 | PodpingV1 | Error>();
    this.uuid = crypto.randomUUID();
    this.logInterval = setInterval(() => {
      console.log(
        `[Filter ${this.uuid!.slice(0, 8)}] Podping count: ${
          this.podpingCount
        }, Emitted count: ${this.emittedCount}`
      );
    }, 0.2 * 60 * 1000);
  }

  async connect() {
    for await (const podping of this.relayEmitter) {
      if (typeof podping === typeof Error) {
        console.log("relay error", podping);
      } else {
        this.handlePodping(podping as PodpingV0 | PodpingV1);
      }
    }
    this.shutdown();
  }

  private handlePodping(podping: PodpingV0 | PodpingV1) {
    this.podpingCount += 1;
    if ((podping as PodpingV0).urls) {
      // version 0.x payload
      const p: PodpingV0 = podping as PodpingV0;
      for (const url of p.urls) {
        if (this.podpingFilter.test(url)) {
          console.log(`Matched reason "${p.reason}", url: ${url}`);
          this.postUpdate(podping);
        }
      }
    } else {
      // version 1.0 payload
      const p: PodpingV1 = podping as PodpingV1;
      for (const iri of p.iris) {
        if (this.podpingFilter.test(iri)) {
          console.log(`Matched reason "${p.reason}", iri: ${iri}`);
          this.postUpdate(podping);
        }
      }
    }
  }

  /***
   * Inject a PodpingV1 message with the iris field set to an array containing
   * the given url. For testing.
   */
  public inject(iri: string, reason = "update", filter = true) {
    if (!filter || this.podpingFilter.test(iri)) {
      this.postUpdate({
        version: "1.0",
        medium: "podcast",
        reason: reason,
        iris: [iri],
      } as PodpingV1);
    }
  }

  public getEmitter() {
    return this.filterEmitter;
  }

  // Stubbable function for testability.
  public postUpdate(p: PodpingV0 | PodpingV1) {
    this.emittedCount += 1;
    this.filterEmitter.post(p);
  }

  public postError(err: Error) {
    this.filterEmitter.post(err);
  }
  // Close connections and stop processing.
  public shutdown() {
    console.log(`[Filter ${this.uuid!.slice(0, 8)}] Shutting down`);
    if (this.logInterval) {
      clearInterval(this.logInterval);
      this.logInterval = undefined;
    }
  }
}
