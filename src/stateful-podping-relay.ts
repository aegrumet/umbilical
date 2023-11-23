import { Evt } from "../deps.ts";
import {
  PodpingMessage,
  PodpingV0,
  PodpingV1,
} from "./interfaces/livewire-podping-websocket.ts";

const PODPING_ORIGIN = "wss://api.livewire.io/ws/podping";

const CONNECT_ATTEMPTS = 7;
const CONNECT_INITIAL_DELAY = 1000;

export default class StatefulPodpingRelay {
  private ws: WebSocket | null = null;
  private patterns: Array<RegExp>;
  private emitter: Evt<string>;
  private connectAttemptNumber = 0;
  private connectDelay = CONNECT_INITIAL_DELAY;
  private reconnectQueued = false;

  constructor() {
    this.patterns = Array<RegExp>();
    this.emitter = Evt.create<string>();

    this.connect();
  }

  /***
   * Tries to connect or reconnect to a websocket server with exponential
   * backoff.
   */
  private connect() {
    this.connectAttemptNumber += 1;
    console.log("Connecting to Podping...", this.connectAttemptNumber);
    this.ws = new WebSocket(PODPING_ORIGIN);
    this.ws.addEventListener("open", (event) => {
      this.connectAttemptNumber = 0;
      this.connectDelay = CONNECT_INITIAL_DELAY;
    });
    this.ws.addEventListener("message", (event) => this.messageListener(event));
    this.ws.addEventListener("close", (event) => {
      this.handleCloseOrError("close");
    });
    this.ws.addEventListener("error", (event) => {
      this.handleCloseOrError("error");
    });
  }

  private handleCloseOrError(reason: string) {
    if (this.reconnectQueued) {
      return;
    }
    console.log(`Attempting reconnection for: ${reason}`);
    if (this.connectAttemptNumber < CONNECT_ATTEMPTS) {
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
      return;
    }
  }

  // deno-lint-ignore no-explicit-any
  private messageListener(event: MessageEvent<any>) {
    const msg: PodpingMessage = JSON.parse(event.data);
    if (msg.t === "podping") {
      for (const op of msg.p) {
        if (op.i === "podping") {
          // version 0.x payload
          const p: PodpingV0 = op.p as PodpingV0;
          for (const url of p.urls) {
            // process feed url
            for (const pattern of this.patterns) {
              if (pattern.test(url)) {
                this.emitter.post(url);
                break;
              }
            }
          }
        } else {
          // version 1.0 payload
          const p: PodpingV1 = op.p as PodpingV1;
          for (const iri of p.iris) {
            // process iri
            for (const pattern of this.patterns) {
              if (pattern.test(iri)) {
                this.emitter.post(iri);
                break;
              }
            }
          }
        }
      }
    }
  }

  public getEmitter() {
    return this.emitter;
  }

  public subscribe(p: string) {
    this.patterns.push(new RegExp(this.escapeRegExp(p)));
  }

  public subscribeRegExp(p: string) {
    this.patterns.push(new RegExp(p));
  }

  public unsubscribe(p: string) {
    this.patterns = this.patterns.filter((pattern) => {
      return pattern.source !== this.escapeRegExp(p);
    });
  }

  public unsubscribeRegExp(p: string) {
    this.patterns = this.patterns.filter((pattern) => {
      return pattern.source !== p;
    });
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
  private escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }
}
