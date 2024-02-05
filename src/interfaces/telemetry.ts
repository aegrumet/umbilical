export type Telemetry = {
  incrementCounter: (counter: string, name: string, value: number) => void;
  incrementUpDownCounter: (
    counter: string,
    name: string,
    value: number
  ) => void;
};
