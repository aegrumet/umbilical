# umbilical

Lifeline services for podcast PWAs.

## authentication

You must set the `UMBILICAL_KEYS` environment variable in order to serve
requests. It should be set to a comma-separated list of valid signing keys.

To authenticate, clients should send a request header with the following format:

```
    X-Umbilical-Signature: t=<timestamp in milliseconds>,s=<hmac-sha256(`${timestamp}.${request url}`)>
```

The request url includes everything after the domain name and port, for example if full
url is

```
http://localhost:8000/API/proxy?rss=http%3A%2F%2Fmp3s.nashownotes.com%2Fpc20rss.xml
```

then the signature should be generated from

```
/API/proxy?rss=http%3A%2F%2Fmp3s.nashownotes.com%2Fpc20rss.xml
```

The hmac should be generated using one of the signing keys in `UMBILICAL_KEYS`.

To allow unauthenticated requests, set `UMBILICAL_KEYS` to "DANGEROUSLY_ALLOW_ALL".

See `src/verify.ts` for full details of signature verification.

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

## deploy

The latest image for this repo is posted to [Docker Hub](https://hub.docker.com/r/aegrumet/umbilical/tags).

- Run on Deno Deploy: [deploy/deno](deploy/deno)
- Run on Google Cloud Run: [deploy/gcloud/terraform](deploy/gcloud/terraform)
- Run on other clouds: submit pull request.

## warnings

Operating an open proxy is risky. We strongly recommend not using "DANGEROUSLY_ALLOW_ALL" in production.

## last word

Please consider supporting the index! For more info see **Help us out...** at [podcastindex.org](https://podcastindex.org).
