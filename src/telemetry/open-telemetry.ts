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
  "podping.relay.podpings",
  "podping.relay.filtered.emitted",
];

const UP_DOWN_COUNTERS: Array<string> = ["podping.websocket.connections"];

const GAUGES: Array<string> = ["podping.webpush.subscriptions"];

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

  private gauges: Record<
    string,
    opentelemetry.ObservableGauge<opentelemetry.Attributes>
  >;

  private constructor() {
    this.counters = {};
    this.upDownCounters = {};
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

    for (const counter of COUNTERS) {
      this.counters[counter] = meter.createCounter(counter, {});
    }

    for (const counter of UP_DOWN_COUNTERS) {
      this.upDownCounters[counter] = meter.createUpDownCounter(counter, {});
    }

    for (const gauge of GAUGES) {
      this.gauges[gauge] = meter.createObservableGauge(gauge, {});
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

  public addGaugeCallback(gauge: string, callback: (result: any) => void) {
    if (this.gauges[gauge] === undefined) {
      console.log("Gauge not found", gauge);
    }
    this.gauges[gauge].addCallback(callback);
  }

  // deno-lint-ignore no-explicit-any
  public removeGaugeCallback(gauge: string, callback: (result: any) => void) {
    if (this.gauges[gauge] === undefined) {
      console.log("Gauge not found", gauge);
    }
    this.gauges[gauge].removeCallback(callback);
  }
}
