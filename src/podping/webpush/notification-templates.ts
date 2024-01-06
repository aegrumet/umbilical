export const NOTIFICATION_TEMPLATES: Record<string, string> = {
  angular: `{
    "title": "Podcast Update",
    "body": "<%= it.reason %> from <%= it.iris[0] %>",
    "notification": {
      "title": "Podcast Update",
      "body": "<%= it.reason %> from <%= it.iris[0] %>",
      "data": {
        "onActionClick": {
          "default": {
            "operation": "navigateLastFocusedOrOpen",
            "url": "/podping?iri=<%= encodeURIComponent(
              it.iris[0]
            )%>&reason=<%= encodeURIComponent(it.reason) %>&medium=<%= encodeURIComponent(it.medium) %>"
          }
        }
      }
    }
  }`,
};
