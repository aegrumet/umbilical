# umbilical

Lifeline services for podcast PWAs.

## proxy API

`GET /API/proxy?rss=<feed url>`

Proxies the provided RSS feed. Returns an error if feed fails parsing. Returns raw RSS xml if parsing passes.

Philsophy: Only proxy RSS, to protect the service, but be otherwise unopinionated about parsing.

## search API

`GET /API/search?q=<search query>`

Relays a query to [PodcastIndex's](https://podcastindex.org/) [Search Podcasts API](https://podcastindex-org.github.io/docs-api/#get-/search/byterm).

Requires the following environment variables to be set:

- `PI_API_KEY`
- `PI_API_SECRET`

You can sign up for free credentials at [api.podcastindex.org](https://api.podcastindex.org/).

## deployment

The latest image for this repo is posted to [Docker Hub](https://hub.docker.com/r/aegrumet/umbilical/tags).

Run on Google Cloud Run: [terraform/gcloud](terraform/gcloud)

Run on other clouds: submit pull request.

## warnings

Operating an open proxy is risky. For now, we recommend keeping any deployment URLs secret.

## last word

Please consider supporting the index! For more info see **Help us out...** at [podcastindex.org](https://podcastindex.org).
