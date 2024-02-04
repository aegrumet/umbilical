import { umbilicalUserAgent } from "../config.ts";
import { Telemetry } from "../interfaces/telemetry.ts";

import {
  opentelemetry,
  Resource,
  MeterProvider,
  PeriodicExportingMetricReader,
  OTLPMetricExporter,
} from "../../server_deps.ts";

export class OpenTelemetry implements Telemetry {
  private counters: Record<string, number>;
  private gauges: Record<string, number>;

  private counter: opentelemetry.Counter<opentelemetry.Attributes>;

  constructor() {
    this.counters = {};
    this.gauges = {};

    const meterProvider = new MeterProvider({
      resource: new Resource({ "service.name": umbilicalUserAgent }),
    });

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
    this.counter.add(value, { name: name });
  }

  setGauge(name: string, value: number): void {
    this.gauges[name] = value;
  }
}
