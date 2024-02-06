export type Telemetry = {
  incrementCounter: (counter: string, name: string, value: number) => void;
  incrementUpDownCounter: (
    counter: string,
    name: string,
    value: number
  ) => void;
  // deno-lint-ignore no-explicit-any
  addGaugeCallback: (gauge: string, callback: (result: any) => void) => void;
  // deno-lint-ignore no-explicit-any
  removeGaugeCallback: (gauge: string, callback: (result: any) => void) => void;
};
