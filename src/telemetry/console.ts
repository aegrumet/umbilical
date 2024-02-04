import { Telemetry } from "../interfaces/telemetry.ts";

export class ConsoleTelemetry implements Telemetry {
  private counters: Record<string, number>;
  private gauges: Record<string, number>;

  constructor() {
    this.counters = {};
    this.gauges = {};
  }

  incrementCounter(name: string, value: number): void {
    if (this.counters[name] === undefined) {
      this.counters[name] = 0;
    }
    this.counters[name] += value;
    console.log(
      `Counter ${name} incremented by ${value}. Current value: ${this.counters[name]}`
    );
  }

  setGauge(name: string, value: number): void {
    this.gauges[name] = value;
    console.log(`Gauge ${name} set to ${value}`);
  }
}
