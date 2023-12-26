# Deploy on Deno Deploy

[Digital Ocean App Platform](https://www.digitalocean.com/products/app-platform)
is a fully-managed infrastructure provider that provides always-on server
processes needed for webpush.

## Deploy steps

- Sign in/up on Digital Ocean
- Create a new project on Digital Ocean
- Create a new App in the project
- Under **Create Resource From Source Code**, select **Docker Hub** and enter `aegrumet/umbilical` and choose the tag `latest`
- Under **Resources** click **Edit Plan**
- Select your plan
- **IMPORTANT:** Set the number of containers to 1.
  - Umbilical stores state locally to the container, for now.
  - Unless you can guarantee stickiness between clients and containers, stick to 1 container.
- Under **Environment Variables** add environment variables (see the top level README.md for details)
- Review remaining settings and deploy.
