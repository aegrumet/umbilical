# Deploy on Deno Deploy

[Deno Deploy](https://deno.com/deploy) is a serverless platform for Deno, and probably the easiest way to deploy umbilical.

It's [free for personal use and non-commercial projects](https://deno.com/deploy/pricing).

## Deploy steps

- Fork umbilical on GitHub
- Sign in/up on Deno Deploy
- Create a new project on Deno Deploy
- Under **Deploy your own code** at the right, select your forked umbilical repo
- Connect your GitHub account and this repo to Deno Deploy, if necessary
- Under **Build mode** click on **No build step**
- Accept the default **Entry point** as `main.ts`
- Click **Create & Deploy**
- After deployment you should be taken to the Deno Deploy project page for the new project.
- Click **Settings** in the navigation below the project name
- Scroll to **Environment Variables** and add variables for `UMBILICAL_KEYS`, `PI_API_KEY`, and `PI_API_SECRET`
- Click **Save (3 new)** to save changes. This will create a new deployment.
- Navigate to **Overview** and find the list of deployments.
- If the newest configuration is not already deployed, click the 3 dots to the
  right of the latest configuration and select **Promote to production**.
  - **NOTE:** The Deno Deploy UI is a little confusing, it can be hard to tell
    which deployment is which. Keep track of which deployment id was previously
    live before switching.
- Your umbilical instance should now be live at the URL listed under **Production**.
