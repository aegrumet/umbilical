# umbilical

Lifeline services for podcast PWAs.

## authentication

You must set `UMBILICAL_KEYS` in the runtime environment in order to serve
requests. It should be set to a comma-separated list of valid signing keys.

To authenticate, clients should send a request header with the following format:

```
    X-Umbilical-Signature: t=<timestamp in milliseconds>,s=<hmac-sha256(`${timestamp}.${full request url}`)>
```

The hmac should be generated using one of the signing keys in `UMBILICAL_KEYS`.

To allow unauthenticated requests, set `UMBILICAL_KEYS` to "DANGEROUSLY_ALLOW_ALL".

See `src/verify.ts` for full details of signature verification.

## proxy API

`GET /API/proxy?rss=<rss url>`

`GET /API/proxy?chapters=<chapters url>`

`GET /API/proxy?opml=<opml url>`

Proxies the RSS, chapters, or opml url. Returns an error if the resource fails parsing. Returns the raw unparsed resource if parsing passes.

Philsophy: Proxy only known formats, to protect the service, but be otherwise unopinionated about parsing.

## search API

`GET /API/search?q=<search query>`

Relays a query to [PodcastIndex's](https://podcastindex.org/) [Search Podcasts API](https://podcastindex-org.github.io/docs-api/#get-/search/byterm).

Requires the following environment variables to be set:

- `PI_API_KEY`
- `PI_API_SECRET`

You can sign up for free credentials at [api.podcastindex.org](https://api.podcastindex.org/).

## podping proxy API

Proxies podpings from [Livewire's podping websocket service](https://livewire.io/podping-via-websockets/).

By default, all podpings are filtered out. Callers must subscribe to URLs or IRIs of interest.

Messages are passed unmodified using Livewire's format as either `PodpingV0` or
`PodpingV1` (see the post linked above for details).

Websocket Endpoint: `/ws-API/podping`

API:

- `subscribe(string, string[])`: subscribe to podpings whose URL (v0.x) or IRI (v1.x) match the given string(s) exactly
- `unsubscribe(string, string[])`: unsubscribe from podpings whose URL (v0.x) or IRI (v1.x) match the given string(s) exactly
- `subscribeRegExp(string, string[])`: subscribe to podpings whose URLs (v0.x) or IRIs (v1.x) match RegExps built from the given string(s)
- `unsubscribeRegExp(string, string[])`: unsubscribe from podpings whose URLs (v0.x) or IRIs (v1.x) match RegExps built from the given string(s)

## deploy

The latest image for this repo is posted to [Docker Hub](https://hub.docker.com/r/aegrumet/umbilical/tags).

- Run on Cloudflare: [deploy/cloudflare](deploy/cloudflare)
- Run on Deno Deploy: [deploy/deno](deploy/deno)
- Run on Google Cloud Run: [deploy/gcloud/terraform](deploy/gcloud/terraform)
- Run on other clouds: submit pull request.

## warnings

Operating an open proxy is risky. We strongly recommend not using "DANGEROUSLY_ALLOW_ALL" in production.

## last word

Please consider supporting the index! For more info see **Help us out...** at [podcastindex.org](https://podcastindex.org).
