import { Evt } from "../../../deps.ts";
import {
  PodpingMessage,
  PodpingV0,
  PodpingV1,
} from "../../interfaces/livewire-podping-websocket.ts";
import { PodpingFilter } from "../../interfaces/podping-filter.ts";

const PODPING_ORIGIN = "wss://api.livewire.io/ws/podping";

export const MAX_CONNECT_ATTEMPTS = 7;
const CONNECT_INITIAL_DELAY = 1000;

export default class PodpingRelayFiltered {
  private ws: WebSocket | null = null;
  private emitter: Evt<PodpingV0 | PodpingV1 | Error>;
  private connectAttemptNumber = 0;
  private connectDelay = CONNECT_INITIAL_DELAY;
  private reconnectQueued = false;
  private podpingFilter: PodpingFilter;
  private uuid: string | undefined;
  private logInterval: number | undefined;

  podpingCount = 0;
  emittedCount = 0;

  constructor(podpingFilter: PodpingFilter) {
    this.podpingFilter = podpingFilter;
    this.emitter = Evt.create<PodpingV0 | PodpingV1 | Error>();
    this.uuid = crypto.randomUUID();
    this.logInterval = setInterval(() => {
      console.log(
        `[${this.uuid!.slice(0, 8)}] Podping count: ${
          this.podpingCount
        }, Emitted count: ${this.emittedCount}`
      );
    }, 10 * 60 * 1000);
  }

  /***
   * Tries to connect or reconnect to a websocket server with exponential
   * backoff.
   */
  public connect() {
    this.connectAttemptNumber += 1;
    console.log("Connecting to Podping...", this.connectAttemptNumber);
    this.ws = this.newWebSocket(PODPING_ORIGIN);
    this.ws.addEventListener("open", (event) => this.handleOpen(event));
    this.ws.addEventListener("message", (event) => this.handleMessage(event));
    this.ws.addEventListener("close", (_) => {
      this.handleCloseOrError("close");
    });
    this.ws.addEventListener("error", (_) => {
      this.handleCloseOrError("error");
    });
  }

  public handleOpen(_: Event) {
    this.connectAttemptNumber = 0;
    this.connectDelay = CONNECT_INITIAL_DELAY;
  }

  public handleCloseOrError(reason: string) {
    if (this.reconnectQueued) {
      return;
    }
    console.log(
      `Attempting reconnection for: ${reason}, attempt #${this.connectAttemptNumber}, max attempts: ${MAX_CONNECT_ATTEMPTS}`
    );
    if (this.connectAttemptNumber < MAX_CONNECT_ATTEMPTS) {
      this.connectDelay *= 2;
      console.log(
        "Failed to connect to Podping Server. Retrying in " +
          this.connectDelay +
          "ms."
      );
      this.reconnectQueued = true;
      setTimeout(() => {
        this.reconnectQueued = false;
        this.connect();
      }, this.connectDelay);
    } else {
      console.log("Failed to connect to Podping Server. Giving up.");
      this.postError(new Error("Failed to connect to Podping Server."));
      this.shutdown();
      return;
    }
  }

  // deno-lint-ignore no-explicit-any
  private handleMessage(event: any) {
    const msg: PodpingMessage = JSON.parse(event.data);
    if (msg.t === "podping") {
      this.podpingCount += 1;
      for (const op of msg.p) {
        if (op.i === "podping") {
          // version 0.x payload
          const p: PodpingV0 = op.p as PodpingV0;
          for (const url of p.urls) {
            if (this.podpingFilter.test(url)) {
              console.log(`Matched reason "${p.reason}", url: ${url}`);
              this.postUpdate({
                ...p,
                urls: [url],
              });
            }
          }
        } else {
          // version 1.0 payload
          const p: PodpingV1 = op.p as PodpingV1;
          for (const iri of p.iris) {
            if (this.podpingFilter.test(iri)) {
              console.log(`Matched reason "${p.reason}", iri: ${iri}`);
              this.postUpdate({
                ...p,
                iris: [iri],
              });
            }
          }
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
    return this.emitter;
  }

  // Stubbable function for testability.
  public postUpdate(p: PodpingV0 | PodpingV1) {
    this.emittedCount += 1;
    this.emitter.post(p);
  }

  public postError(err: Error) {
    this.emitter.post(err);
  }

  // Stubbable function for testability.
  public newWebSocket(url: string) {
    return new WebSocket(url);
  }

  // Close connections and stop processing.
  public shutdown() {
    if (this.logInterval) {
      clearInterval(this.logInterval);
      this.logInterval = undefined;
    }
    try {
      if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
        this.ws.close();
      }
    } catch (_) {
      // do nothing
    }
  }
}
