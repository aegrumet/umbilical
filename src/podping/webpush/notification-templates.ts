export const NOTIFICATION_TEMPLATES: Record<string, string> = {
  // Angular-style notification body, see
  // https://angular.io/guide/service-worker-notifications#notification-click-handling
  angular: `{
    "title": "Podcast Update",
    "body": "<%= it.podping.reason %> from <%= it.feedInfo ? it.feedInfo.feed.title : it.podping.iris[0] %>",
    "notification": {
      "title": "Podcast Update",
      "body": "<%= it.podping.reason %> from <%= it.feedInfo ? it.feedInfo.feed.title : it.podping.iris[0] %>",
      <% if (it.feedInfo) { %>
        "icon": "<%= it.feedInfo.feed.image %>",
      <% } %>
      "data": {
        "onActionClick": {
          "default": {
            "operation": "navigateLastFocusedOrOpen",
            "url": "/podping?iri=<%= encodeURIComponent(
              it.podping.iris[0]
            )%>&reason=<%= encodeURIComponent(it.podping.reason) %>&medium=<%= encodeURIComponent(it.podping.medium) %>"
          }
        }
      }
    }
  }`,
};
