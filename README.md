# umbilical

Lifeline services for podcast PWAs.

## proxy API

`GET /API/proxy?rss=<feed url>`

Proxies the provided RSS feed. Returns an error if feed fails parsing.

## search API

`GET /API/search?q=<search query>`

Relays a query to [PodcastIndex's](https://podcastindex.org/) [Search Podcasts API](https://podcastindex-org.github.io/docs-api/#get-/search/byterm).

Requires the following environment variables to be set:

- `PI_API_KEY`
- `PI_API_SECRET`

You can sign up for free credentials at [api.podcastindex.org](https://api.podcastindex.org/).

## warnings

Operating an open proxy is risky. Until this appliance supports authentication, we recommend that you keep any deployment URLs secret.

## last word

Please consider supporting the index! For more info see **Help us out...** at [podcastindex.org](https://podcastindex.org).
