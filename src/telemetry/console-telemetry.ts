import { Telemetry } from "../interfaces/telemetry.ts";

export class ConsoleTelemetry implements Telemetry {
  private counters: Record<string, Record<string, number>>;
  private upDownCounters: Record<string, Record<string, number>>;
  // deno-lint-ignore no-explicit-any
  private gauges: Record<string, Array<(result: any) => void>>;

  constructor() {
    this.counters = {};
    this.upDownCounters = {};
    this.gauges = {};
  }

  incrementCounter(counter: string, name: string, value: number): void {
    if (this.counters[counter] === undefined) {
      this.counters[counter] = {};
      if (this.counters[counter][name] == undefined) {
        this.counters[counter][name] = 0;
      }
    }
    this.counters[counter][name] += value;
    console.log(
      `Counter ${counter}, name ${name} incremented by ${value}. Current value: ${this.counters[counter][name]}`
    );
  }

  incrementUpDownCounter(counter: string, name: string, value: number): void {
    if (this.upDownCounters[counter] === undefined) {
      this.upDownCounters[counter] = {};
      if (this.upDownCounters[counter][name] == undefined) {
        this.upDownCounters[counter][name] = 0;
      }
    }
    this.upDownCounters[counter][name] += value;
    console.log(
      `Counter ${counter}, name ${name} incremented by ${value}. Current value: ${this.upDownCounters[counter][name]}`
    );
  }

  // TODO - add interval with console log that iterates all keys, calls the callback, and console
  // logs the result.

  addGaugeCallback(gauge: string, callback: (result: any) => void) {
    if (this.gauges[gauge] === undefined) {
      this.gauges[gauge] = [];
    }
    this.gauges[gauge].push(callback);
  }

  removeGaugeCallback(gauge: string, callback: (result: any) => void) {
    if (this.gauges[gauge] === undefined) {
      return;
    }
    this.gauges[gauge] = this.gauges[gauge].filter((cb) => cb !== callback);
  }
}
