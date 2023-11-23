// https://livewire.io/podping-via-websockets/

export interface PodpingMessage {
  /** Type. */
  readonly t: "podping";

  /** Websocket payload version. */
  readonly v: 2;

  /** Hive api server polled by the backend to provide the data. */
  readonly a: string;

  /** Hive block number. */
  readonly n: number;

  /** Hive operation count.
   *
   * Total number of operations in the block, not just Podpings. */
  readonly o: number;

  /** Podping operations. */
  readonly p: Operation[];
}

export interface Operation {
  /** Auth used to write the transaction. */
  readonly a: string;

  /** ISO 8601 timestamp. */
  readonly t: string;

  /** Hive event id like 'podping' (v0.x) or 'pp_podcast_update' (v1.0) */
  readonly i: string;

  /** Podping. */
  readonly p: Podping;
}

// Raw Podping payload json format
// i.e. "json" from https://github.com/Podcastindex-org/podping.cloud#what-it-does
export type Podping = PodpingV0 | PodpingV1;

export interface PodpingV0 {
  readonly version: "0.2" | "0.3";
  readonly num_urls: number;
  readonly reason: "feed_update";
  readonly urls: string[];
}

export interface PodpingV1 {
  readonly version: "1.0";
  readonly medium: string; // e.g. podcast, music, video, etc
  readonly reason: string; // e.g. update or live
  readonly iris: string[]; // can contain IRIs that are not http(s) URLs
}
