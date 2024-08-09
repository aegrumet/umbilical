# Contributing

Hello fellow traveler! If you'd like to add something to Umbilical, contributions
are welcome. It's still early days here.

## Developer setup

### Install Deno

https://docs.deno.com/runtime/manual/getting_started/installation

### Sign up for a PodcastIndex developer key and secret

This is needed for podcast searching and other features.

https://api.podcastindex.org

### Create web push credentials, if needed

This is needed for supporting Web Push notifications to the browser.

```bash
deno task generate
```

### Create an Alby oauth client, if needed

This is needed for boost payments.

https://guides.getalby.com/developer-guide/v/alby-wallet-api/reference/authorization

Once you have Alby client credentials, populate the data structure in
[mocks/oauth2-config.json](mocks/oauth2-config.json), base64url-encode it, and
set the `OAUTH2_CONFIG` environment variable to the result.

A helper script is provided to generate the base64url-encoded config:

`deno task encode-oauth2-config mocks/oauth2-config.json`

## Run Umbilical

```bash
env \
PI_API_KEY=$PI_API_KEY \
PI_API_SECRET=$PI_API_SECRET \
UMBILICAL_KEYS=$UMBILICAL_KEY,DANGEROUSLY_ALLOW_ALL \
ENABLED_FEATURES=proxy,podcastindex,podping_websocket,podping_webpush,oauth2 \
DEBUG=true \
WEBPUSH_TEMPLATE=angular \
WEBPUSH_JWK_BASE64=$WEBPUSH_JWK_BASE64 \
WEBPUSH_THROTTLE_MINUTES=0 \
OAUTH2_CONFIG=$OAUTH2_CONFIG \
deno task dev
```

Umbilical should now be listening on port 8000.
