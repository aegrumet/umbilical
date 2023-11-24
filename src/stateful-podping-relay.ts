import { Evt } from "../deps.ts";
import {
  PodpingMessage,
  PodpingV0,
  PodpingV1,
} from "./interfaces/livewire-podping-websocket.ts";

const PODPING_ORIGIN = "wss://api.livewire.io/ws/podping";

export const MAX_CONNECT_ATTEMPTS = 7;
const CONNECT_INITIAL_DELAY = 1000;

export default class StatefulPodpingRelay {
  private ws: WebSocket | null = null;
  private patterns: Array<RegExp>;
  private emitter: Evt<PodpingMessage>;
  private connectAttemptNumber = 0;
  private connectDelay = CONNECT_INITIAL_DELAY;
  private reconnectQueued = false;

  constructor() {
    this.patterns = Array<RegExp>();
    this.emitter = Evt.create<PodpingMessage>();
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
      return;
    }
  }

  // deno-lint-ignore no-explicit-any
  private handleMessage(event: MessageEvent<any>) {
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
                this.postUpdate(msg);
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
                this.postUpdate(msg);
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

  // Stubbable function for testability.
  public postUpdate(msg: PodpingMessage) {
    this.emitter.post(msg);
  }

  // Stubbable function for testability.
  public newWebSocket(url: string) {
    return new WebSocket(url);
  }
}