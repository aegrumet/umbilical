import { Telemetry } from "../interfaces/telemetry.ts";

export class NullTelemetry implements Telemetry {
  incrementCounter(_counter: string, _name: string, _value: number): void {}
  incrementUpDownCounter(
    _counter: string,
    _name: string,
    _value: number
  ): void {}
}
