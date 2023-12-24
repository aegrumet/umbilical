/**
 * Returns true if we should emit an event for this iri/url, false otherwise.
 */
export interface PodpingFilter {
  test: (str: string) => boolean;
}
