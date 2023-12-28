import { Evt } from "../deps.ts";
import {
  PodpingV0,
  PodpingV1,
} from "../src/interfaces/livewire-podping-websocket.ts";

export default class MockPodpingRelay {
  private emitter: Evt<PodpingV0 | PodpingV1 | Error>;

  constructor() {
    this.emitter = Evt.create<PodpingV0 | PodpingV1 | Error>();
  }

  getEmitter(): Evt<PodpingV0 | PodpingV1 | Error> {
    return this.emitter;
  }

  emit(iri: string) {
    this.emitter.post({
      version: "1.0",
      medium: "podcast",
      reason: "testing",
      iris: [iri],
    } as PodpingV1);
  }
}
