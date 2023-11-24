import { EventEmitter } from "../dev_deps.ts";

export type MockWebSocketOptions = {
  openAfterAttempts: number;
  openCurrentAttempt: number;
  openGoSilentAfterAttempts: number;
};

class MockWebsocket extends EventEmitter<
  Record<string, MessageEvent<string>[]>
> {
  private opts: MockWebSocketOptions;

  constructor(_url: string, opts: MockWebSocketOptions) {
    super();
    this.opts = opts;

    if (
      this.opts.openAfterAttempts === 0 ||
      this.opts.openCurrentAttempt < this.opts.openAfterAttempts
    ) {
      if (this.opts.openCurrentAttempt <= this.opts.openGoSilentAfterAttempts) {
        setTimeout(() => {
          this.emit("error");
        }, 1);
      }
      return;
    }
    setTimeout(() => {
      this.emit("open");
    }, 1);
  }

  public addEventListener(
    event: string,
    callback: (event: MessageEvent<string>) => void
  ) {
    this.on(event, callback);
  }
}

export class MockWebsocketStubBuilder {
  mockWebsocketInstance: MockWebsocket | undefined;
  openCurrentAttempt: number;
  constructor() {
    this.openCurrentAttempt = 0;
  }
  build(_url: string, opts: MockWebSocketOptions): (url: string) => WebSocket {
    return (url: string) => {
      this.openCurrentAttempt += 1;
      this.mockWebsocketInstance = new MockWebsocket(url, {
        ...opts,
        openCurrentAttempt: this.openCurrentAttempt,
      });
      return this.mockWebsocketInstance as unknown as WebSocket;
    };
  }
}

export default MockWebsocketStubBuilder;
