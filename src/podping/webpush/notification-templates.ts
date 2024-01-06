export const NOTIFICATION_TEMPLATES: Record<string, string> = {
  // Angular-style notification body, see
  // https://angular.io/guide/service-worker-notifications#notification-click-handling
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
