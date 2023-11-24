import { EventEmitter } from "../dev_deps.ts";

export type MockWebSocketOptions = {
  openAfterAttempts: number;
  openCurrentAttempt: number;
  openMaxAttempts: number;
};

export let mockWebsocketInstance: MockWebsocket | undefined;

class MockWebsocket extends EventEmitter<any> {
  private opts: MockWebSocketOptions;

  constructor(_url: string, opts: MockWebSocketOptions) {
    super();
    this.opts = opts;

    if (
      this.opts.openAfterAttempts === 0 ||
      this.opts.openCurrentAttempt < this.opts.openAfterAttempts
    ) {
      if (this.opts.openCurrentAttempt <= this.opts.openMaxAttempts) {
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

  public addEventListener(event: string, callback: (event: any) => void) {
    this.on(event, callback);
  }
}

export class MockWebsocketStubBuilder {
  openCurrentAttempt: number;
  constructor() {
    this.openCurrentAttempt = 0;
  }
  build(_url: string, opts: MockWebSocketOptions): (url: string) => WebSocket {
    return (url: string) => {
      this.openCurrentAttempt += 1;
      mockWebsocketInstance = new MockWebsocket(url, {
        ...opts,
        openCurrentAttempt: this.openCurrentAttempt,
      });
      return mockWebsocketInstance as unknown as WebSocket;
    };
  }
}

export default MockWebsocketStubBuilder;
