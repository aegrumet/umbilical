import { Telemetry } from "../interfaces/telemetry.ts";

export class NullTelemetry implements Telemetry {
  incrementCounter(_counter: string, _name: string, _value: number): void {}
  incrementUpDownCounter(
    _counter: string,
    _name: string,
    _value: number
  ): void {}
  // deno-lint-ignore no-explicit-any
  addGaugeCallback(_gauge: string, _callback: (result: any) => void): void {}
  removeGaugeCallback(_gauge: string, _callback: (result: any) => void): void {}
}
