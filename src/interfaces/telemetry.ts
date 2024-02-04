export type Telemetry = {
  incrementCounter: (name: string, value: number) => void;
  setGauge: (name: string, value: number) => void;
};
