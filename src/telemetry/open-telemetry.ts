import { umbilicalUserAgent } from "../config.ts";
import { Telemetry } from "../interfaces/telemetry.ts";

import opentelemetry from "npm:@opentelemetry/api";
import { Resource } from "npm:@opentelemetry/resources";
import {
  MeterProvider,
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from "npm:@opentelemetry/sdk-metrics";
// grpc doesn't seem to work with Deno
import { OTLPMetricExporter } from "npm:@opentelemetry/exporter-metrics-otlp-http";

export class OpenTelemetry implements Telemetry {
  private counters: Record<string, number>;
  private gauges: Record<string, number>;

  private counter: any;

  constructor() {
    this.counters = {};
    this.gauges = {};

    const meterProvider = new MeterProvider({
      resource: new Resource({ "service.name": umbilicalUserAgent }),
    });

    const consoleMetricExporter = new ConsoleMetricExporter();
    const consoleMetricReader = new PeriodicExportingMetricReader({
      exporter: consoleMetricExporter,
      exportIntervalMillis: 10000,
    });
    meterProvider.addMetricReader(consoleMetricReader);

    const httpMetricExporter = new OTLPMetricExporter();
    const httpMetricReader = new PeriodicExportingMetricReader({
      exporter: httpMetricExporter,
      exportIntervalMillis: 10000,
    });
    meterProvider.addMetricReader(httpMetricReader);

    opentelemetry.metrics.setGlobalMeterProvider(meterProvider);

    const metrics = opentelemetry.metrics;
    const meter = metrics.getMeter("umbilical.meter");
    this.counter = meter.createCounter("umbilical.counter", {
      description: "Umbilical global counter",
    });
  }

  incrementCounter(name: string, value: number): void {
    if (this.counters[name] === undefined) {
      this.counters[name] = 0;
    }
    this.counters[name] += value;
    console.log(
      `Counter ${name} incremented by ${value}. Current value: ${this.counters[name]}`
    );
    this.counter.add(value, { name: name });
  }

  setGauge(name: string, value: number): void {
    this.gauges[name] = value;
    console.log(`Gauge ${name} set to ${value}`);
  }
}
