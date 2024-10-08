# Umbilical

Umbilical is server side companion for podcast PWAs, supporting things that can't
be done client side.

By design it aims to be ephemeral, minimal, and cheap to run.

# What's this for?

Umbilical should be run as a server, to bridge functional gaps between
browser-based podcast applications and the rest of the ecosystem. Supported
features are highlighted in purple text in the diagram below. Umbilical's role
in supporting those features is highlighted in orange text.

![Umbilical system diagram](umbilical.drawio.png)

Umbilical is not designed for managing user accounts or durably storing
subscription lists. It is mostly stateless, with the exception of ephemerally
stored subscription lists needed for podping notifications. Client applications
should regularly republish their subscriptions to Umbilical, and should not rely
on Umbilical as a storage system.

## Environment variables

| name                          | description                                                                                                                          | default                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `ENABLED_FEATURES`            | comma-separated list of features to enable                                                                                           | 'proxy,podcastindex,podping_websocket' |
| `UMBILICAL_KEYS`              | comma-separated list of valid signing keys (see authentication)                                                                      | n/a                                    |
| `PI_API_KEY`                  | PodcastIndex API key, used for search                                                                                                | n/a                                    |
| `PI_API_SECRET`               | PodcastIndex API secret , used for search                                                                                            | n/a                                    |
| `WEBPUSH_JWK_BASE64`          | base64-encoded JSON Web Key for webpush                                                                                              | n/a                                    |
| `WEBPUSH_CONTACT`             | contact info (subject) for webpush                                                                                                   | n/a                                    |
| `WEBPUSH_TEMPLATE`            | template for webpush notification messages                                                                                           | 'angular'                              |
| `WEBPUSH_THROTTLE_MINUTES`    | number of minutes to wait before emitting a podping push notification for the same `(iri, reason, medium)`. Set to 0 for no waiting. | 60                                     |
| `OAUTH2_CONFIG`               | base64url-encoded JSON object containing oauth2 client configurations (see oauth2 bridge API)                                        | n/a                                    |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP http endpoint for exporting telemetry data to an OpenTelemetry collector                                                        | n/a                                    |

## Features and deployment types

Umbilical ships with a number of features whose availability depends on the
deployment type. Here is a list of deployment types:

| deployment type  | description                                    | lifetime (typical) | examples                                          |
| ---------------- | ---------------------------------------------- | ------------------ | ------------------------------------------------- |
| edge worker      | stateless function                             | &lt;1s             | Deno Deploy, Cloudflare Workers, Google Cloud Run |
| websocket server | stateful for the duration of socket connection | minutes to hours   | Deno Deploy, Cloudflare Workers, Google Cloud Run |
| server           | stateful for the duration of server process    | hours to days      | Digital Ocean App Platform                        |

Here is a list of features and compatible deployment types:

| feature           | description                                                                                     | deploy type              |
| ----------------- | ----------------------------------------------------------------------------------------------- | ------------------------ |
| proxy             | proxy RSS, chapters, and opml files                                                             | all                      |
| podcastindex      | proxy various PodcastIndex APIs including search and lookups                                    | all                      |
| podping_websocket | relay podpings from Livewire's podping websocket service to a running PWA, for subscribed feeds | websocket server, server |
| podping_webpush   | send podpings to running or non-running PWAs using webpush, for subscribed feeds (see below)    | server                   |
| oauth2            | retrieve tokens from an Oauth2 authorization server and securely hand them back to the PWA      | server                   |

## Authentication

You must set `UMBILICAL_KEYS` in the runtime environment in order to serve
requests. It should be set to a comma-separated list of valid signing keys.

Signing keys are used by Umbilical to verify the request signature, which is
passed differently depending on the request type:

- HTTP: the signature is passed in the "X-Umbilical-Signature" request header.
- WebSocket: the signature is passed as the query string.

The request signature has following format:

```
    t=<timestamp in milliseconds>,s=<hmac>
```

The hmac is generated by concatenating the timestamp, a requestLine string
(defined below), and body payload with periods, then generating an HMAC
SHA256 using a signing key as the secret:

     s=<hmac-sha256(`${timestamp}.${requestLine}.${bodyText}`)>

The requestLine string is the request URL without the protocol (https:// or wss://), and including the query string for http(s) only.

Examples:

| request URL                                                                                                                          | requestLine                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| https://umbilical.example.com/API/worker/proxy?rss=https://example.com/feed.rss                                                      | umbilical.example.com/API/worker/proxy?rss=https://example.com/feed.rss |
| wss://umbilical.example.com/API/websocket/podping?t=1704348921430&s=9b0d3593a7f154e1f2e706526c0316d6a5ccd7ac89f70d11d92fcb13495db73a | umbilical.example.com/API/websocket/podping                             |
|                                                                                                                                      |                                                                         |

For PUT, POST, and DELETE requests, the bodyText is serialized JSON. For GET requests the bodyText is empty.

The hmac should be generated using one of the signing keys in `UMBILICAL_KEYS`.

To allow unauthenticated requests, set `UMBILICAL_KEYS` to "DANGEROUSLY_ALLOW_ALL".

See `src/verify.ts` for full details of signature verification.

[examples/authentication.md](examples/authentication.md) has example code for signing requests.

## Proxy API

`GET /API/worker/proxy?rss=<rss url>`

`GET /API/worker/proxy?chapters=<chapters url>`

`GET /API/worker/proxy?opml=<opml url>`

Proxies the RSS, chapters, or opml url. Returns an error if the resource fails parsing. Returns the raw unparsed resource if parsing passes.

Philsophy: Proxy only known formats, to protect the service, but be otherwise unopinionated about parsing.

To assist with detecting feed moves, the proxy adds a `X-Final-URL` header when
the response url differs from the requested one.

## PodcastIndex APIs

Umbilical supports passthrough for a subset of PodcastIndex APIs and related "extras".

Requires the following environment variables to be set:

- `PI_API_KEY`
- `PI_API_SECRET`

You can sign up for free credentials at [api.podcastindex.org](https://api.podcastindex.org/).

### search

`GET /API/worker/pi/search/byterm?q=<search query>`

Relays a query to [PodcastIndex's](https://podcastindex.org/) [Search Podcasts API](https://podcastindex-org.github.io/docs-api/#get-/search/byterm).

### episode by Guid (for resolving remoteItems)

`GET /API/worker/pi/episodes/byguid?feedGuid=<feedGuid>&itemGuid=<itemGuid>`

Returns the episode remoteItem from the given feedGuid and itemGuid.

### podcast by Feed URL (for podcast:guid lookups)

`GET /API/worker/pi/podcasts/byfeedurl?feedUrl=<feedUrl>`

Returns the podcast from the given feedUrl.

### podcast by Feed GUID (for handling feed moves)

`GET /API/worker/pi/podcasts/byguid?guid=<guid>`

Returns the podcast from the given podcast:guid.

### podroll API

`GET /API/worker/pi/extras/podroll?rss=<rss url>`

Returns the rss feed's podroll in OPML format.

Returns an error if the feed has no podroll.

## Podping websocket API

Proxies podpings from [Livewire's podping websocket
service](https://livewire.io/podping-via-websockets/) via websocket to connected
clients.

By default, all podpings are filtered out. Clients must subscribe to URLs or IRIs of interest.

Also, clients MUST respond to a ping message with a pong message. If a client
fails to respond, it will be disconnected. Pings and Pongs are simple JSON
objects having top-level `ping` and `pong` properties, respectively.

Podping messages are passed unmodified using Livewire's format as either
`PodpingV0` or `PodpingV1` (see the post linked above for details).

Websocket Endpoint: `/API/websocket/podping`

API:

- `addRssUrls(string[])`: subscribe to podpings whose URLs (v0.x) or IRIs (v1.x) match the given strings
- `deleteRssUrls(string[])`: unsubscribe from podpings whose URLs (v0.x) or IRIs (v1.x) match the given strings

For matching purposes, url schemes and trailing slashes are ignored.

## Podping webpush API

Sends webpush notifications to subscribed clients.

Note: this feature requires an always-on server deployment, such as Digital
Ocean App Platform. Also, it relies on ephemeral storage, so deployments should
use a single vm or container, and clients should regularly re-push their
subscription.

You can generate a webpush keypair for setting `WEBPUSH_JWK_BASE64` as follows:

```bash
deno task generate
```

API:

- `GET /API/server/podping-webpush/pubkey`: get the public key for webpush

  - response body:

    ```
    string
    ```

- `PUT /API/server/podping-webpush/subscription`: add push subscription for podping messages from the provided RSS URLs

  - body:

    ```
    {
        rssUrls: string[],
        pushSubscription: PushSubscription
    }
    ```

  - The push subscription should be a JSON object as returned by the [PushManager.subscribe()](https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe) method.
  - Subsequent calls overwrite previous state for the subscription.

- `DELETE /API/server/podping-webpush/subscription`: delete the push subscription

  - body:

    ```
    {
        pushSubscription: PushSubscription
    }
    ```

  - The push subscription should be a JSON object as returned by the [PushManager.subscribe()](https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe) method.

### notification templates

Webpush notifications are developer-customizable. To create a new template, add
a key to
[src/podping/webpush/notification-templates.ts](src/podping/webpush/notification-templates.ts)
and set `WEBPUSH_TEMPLATE` to that key in the runtime environment. Templates are
serialized JSON strings that use [Eta template
syntax](https://eta.js.org/docs/intro/template-syntax) to interpolate values from the podping message.

## Oauth2 bridge API (experimental)

Retrieve tokens from an Oauth2 authorization server.

This could also be handled directly from the PWA using a PKCE flow.

In this implementation, Umbilical stores the `client_id` and `client_secret`.
Unlike with a PWA, Umbilical can keep the `client_secret` secret. Also, it
unbundles the `client_id` from the PWA and thereby keeps the PWA generic.

This implementation uses Umbilical authentication and a PKCE-like flow to
guard token handoff from Umbilical to the PWA.

Before calling Umbilical's `login` method, the PWA should generate a
`code_verifier` and `code_challenge` in the same manner as a PKCE flow.

- `GET /API/server/oauth2/:clientkey/login?code_challenge=<code_challenge>&redirect_uri=<redirect_uri>`

  - Initiates a login flow using the oauth client mapped to `clientkey` in the config.

- `GET /API/server/oauth2/:clientkey/callback`

  - Handles the oauth2 callback from the authorization server.
  - Returns a random `code` to the PWA.

- `POST /API/server/oauth2/:clientkey/token` (requires authentication)

  - body:

    ```
    {
        code: string,
        code_verifier: string
    }
    ```

  - PWA uses this call to exchange the `code` for an access token.

- `POST /API/server/oauth2/:clientkey/refreshToken` (requires authentication)

  - body:

    ```
    {
        refreshToken: string
    }
    ```

  - PWA uses this call to refresh the access token.

Oauth clients are configured by populating the data structure in
[mocks/oauth2-config.json](mocks/oauth2-config.json), base64url-encoding it, and
setting the `OAUTH2_CONFIG` environment variable to the result.

A helper script is provided to generate the base64url-encoded config:

`deno task encode-oauth2-config mocks/oauth2-config.json`

## Deploy

The latest image for this repo is posted to [Docker Hub](https://hub.docker.com/r/aegrumet/umbilical/tags).

- Run on Cloudflare: [deploy/cloudflare](deploy/cloudflare)
- Run on Deno Deploy: [deploy/deno](deploy/deno)
- Run on Google Cloud Run: [deploy/gcloud/terraform](deploy/gcloud/terraform)
- Run on Digital Ocean App Platform: [deploy/digitaocean](deploy/digitalocean)
- Run on other clouds: submit pull request.

## Warnings

Operating an open proxy is risky. We strongly recommend not using "DANGEROUSLY_ALLOW_ALL" in production.

## Last word

Please consider supporting the index! For more info see **Help us out...** at [podcastindex.org](https://podcastindex.org).
