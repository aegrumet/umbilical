# umbilical

Lifeline services for podcast PWAs.

## environment variables

| name                 | description                                                     | default                          |
| -------------------- | --------------------------------------------------------------- | -------------------------------- |
| `ENABLED_FEATURES`   | comma-separated list of features to enable                      | `proxy,search,podping_websocket` |
| `UMBILICAL_KEYS`     | comma-separated list of valid signing keys (see authentication) | n/a                              |
| `PI_API_KEY`         | PodcastIndex API key, used for search                           | n/a                              |
| `PI_API_SECRET`      | PodcastIndex API secret , used for search                       | n/a                              |
| `WEBPUSH_JWK_BASE64` | base64-encoded JSON Web Key for webpush                         | n/a                              |
| `WEBPUSH_CONTACT`    | contact info (subject) for webpush                              | n/a                              |

## features and deployment types

Umbilical ships with a number of features whose availability depends on the deployment type. Here is a list of deployment types:

| deployment type  | description                                    | lifetime (typical) | examples                                          |
| ---------------- | ---------------------------------------------- | ------------------ | ------------------------------------------------- |
| edge worker      | stateless function                             | &lt;1s             | Deno Deploy, Cloudflare Workers, Google Cloud Run |
| websocket server | stateful for the duration of socket connection | minutes to hours   | Deno Deploy, Cloudflare Workers, Google Cloud Run |
| server           | stateful for the duration of server process    | hours to days      | Digital Ocean App Platform                        |

Here is a list of features and compatible deployment types:

| feature           | description                                                                                            | deploy type      |
| ----------------- | ------------------------------------------------------------------------------------------------------ | ---------------- |
| proxy             | proxy RSS, chapters, and opml files                                                                    | all              |
| search            | proxy PodcastIndex search API                                                                          | all              |
| podping_websocket | proxy podpings from Livewire's podping websocket for subscribed podcasts back to the PWA, while online | websocket server |
| podping_webpush   | send webpush notifications to subscribed clients (see below)                                           | server           |

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

`GET /API/worker/proxy?rss=<rss url>`

`GET /API/worker/proxy?chapters=<chapters url>`

`GET /API/worker/proxy?opml=<opml url>`

Proxies the RSS, chapters, or opml url. Returns an error if the resource fails parsing. Returns the raw unparsed resource if parsing passes.

Philsophy: Proxy only known formats, to protect the service, but be otherwise unopinionated about parsing.

## search API

`GET /API/worker/search?q=<search query>`

Relays a query to [PodcastIndex's](https://podcastindex.org/) [Search Podcasts API](https://podcastindex-org.github.io/docs-api/#get-/search/byterm).

Requires the following environment variables to be set:

- `PI_API_KEY`
- `PI_API_SECRET`

You can sign up for free credentials at [api.podcastindex.org](https://api.podcastindex.org/).

## podping websocket API

Proxies podpings from [Livewire's podping websocket service](https://livewire.io/podping-via-websockets/) via websocket while online.

By default, all podpings are filtered out. Callers must subscribe to URLs or IRIs of interest.

Also, clients MUST respond to a ping message with a pong message. If a client
fails to respond to a ping message, it will be disconnected. Pings and Pongs are
simple JSON objects having top-level `ping` and `pong` properties, respectively.

Messages are passed unmodified using Livewire's format as either `PodpingV0` or
`PodpingV1` (see the post linked above for details).

Websocket Endpoint: `/API/websocket/podping`

API:

- `subscribe(string, string[])`: subscribe to podpings whose URL (v0.x) or IRI (v1.x) match the given string(s) exactly
- `unsubscribe(string, string[])`: unsubscribe from podpings whose URL (v0.x) or IRI (v1.x) match the given string(s) exactly
- `subscribeRegExp(string, string[])`: subscribe to podpings whose URLs (v0.x) or IRIs (v1.x) match RegExps built from the given string(s)
- `unsubscribeRegExp(string, string[])`: unsubscribe from podpings whose URLs (v0.x) or IRIs (v1.x) match RegExps built from the given string(s)

## podping webpush API (experimental)

Sends webpush notifications to subscribed clients.

Note: this feature requires an always-on server deployment, such as Digital Ocean App Platform.

API:

- `GET /API/server/podping-webpush/pubkey`: get the public key for webpush

  - response body:

    ```
    string
    ```

- `PUT /API/server/podping-webpush/register`: subscribe to podping updates for the given RSS URLs and push subscription

  - body:

    ```
    {
        rssUrls: string[],
        pushSubscription: PushSubscription
    }
    ```

  - The push subscription should be a JSON object as returned by the [PushManager.subscribe()](https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe) method.
  - Subsequent calls overwrite previous state for the given subscription.

- `DELETE /API/server/podping-webpush/register`: unsubscribe from podping updates for the given push subscription

  - body:

    ```
    {
        pushSubscription: PushSubscription
    }
    ```

  - The push subscription should be a JSON object as returned by the [PushManager.subscribe()](https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe) method.

## deploy

The latest image for this repo is posted to [Docker Hub](https://hub.docker.com/r/aegrumet/umbilical/tags).

- Run on Cloudflare: [deploy/cloudflare](deploy/cloudflare)
- Run on Deno Deploy: [deploy/deno](deploy/deno)
- Run on Google Cloud Run: [deploy/gcloud/terraform](deploy/gcloud/terraform)
- Run on Digital Ocean App Platform: [deploy/digitaocean](deploy/digitalocean)
- Run on other clouds: submit pull request.

## warnings

Operating an open proxy is risky. We strongly recommend not using "DANGEROUSLY_ALLOW_ALL" in production.

## last word

Please consider supporting the index! For more info see **Help us out...** at [podcastindex.org](https://podcastindex.org).
