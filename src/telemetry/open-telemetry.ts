import { umbilicalUserAgent } from "../config.ts";
import { Telemetry } from "../interfaces/telemetry.ts";

import {
  opentelemetry,
  Resource,
  MeterProvider,
  PeriodicExportingMetricReader,
  OTLPMetricExporter,
} from "../../server_deps.ts";

const COUNTERS = [
  "http.requests",
  "podping.relay.filtered.podpings",
  "podping.relay.filtered.emitted",
];

const UP_DOWN_COUNTERS: Array<string> = [
  "podping.webpush.subscriptions",
  "podping.websocket.connections",
];

export class OpenTelemetry implements Telemetry {
  private static instance: OpenTelemetry;

  private counters: Record<
    string,
    opentelemetry.Counter<opentelemetry.Attributes>
  >;
  private upDownCounters: Record<
    string,
    opentelemetry.UpDownCounter<opentelemetry.Attributes>
  >;

  private constructor() {
    this.counters = {};
    this.upDownCounters = {};

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

    for (const counter of COUNTERS) {
      this.counters[counter] = meter.createCounter(counter, {});
    }

    for (const counter of UP_DOWN_COUNTERS) {
      this.upDownCounters[counter] = meter.createUpDownCounter(counter, {});
    }
  }

  public static getInstance(): OpenTelemetry {
    if (!OpenTelemetry.instance) {
      OpenTelemetry.instance = new OpenTelemetry();
    }

    return OpenTelemetry.instance;
  }

  public incrementCounter(counter: string, name: string, value: number): void {
    if (this.counters[counter] === undefined) {
      console.log("Counter not found", counter);
    }
    this.counters[counter].add(value, { name });
  }

  public incrementUpDownCounter(
    counter: string,
    name: string,
    value: number
  ): void {
    if (this.upDownCounters[counter] === undefined) {
      console.log("Up down counter not found", counter);
    }
    this.upDownCounters[counter].add(value, { name });
  }
}
