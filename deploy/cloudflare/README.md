# Deploy on Cloudflare

[CloudFlare Workers](https://workers.cloudflare.com/) is a serverless platform for JavaScript.

You can deploy Umbilical on CloudFlare Workers using [Denoflare](https://denoflare.dev/).

## Deploy steps

- Create a Cloudflare account if you don't have one
- Create an [API token](https://dash.cloudflare.com/profile/api-tokens)
  - Start from the `Edit Cloudflare Workers` template
- Install [denoflare](https://denoflare.dev/)
- Clone umbilical on GitHub
- Edit `deploy/cloudflare/.denoflare`, and populate with your Cloudflare information, Podcast Index credentials, and `UMBILICAL_KEYS`
- Deploy with [`denoflare push`](https://denoflare.dev/cli/push)
  - Example:
  - `denoflare push umbilical --config deploy/cloudflare/.denoflare`
