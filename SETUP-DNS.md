# Going live with studiobluemli.com

This is a one-time setup. It takes about 15 minutes. You only do this when the
site is ready for the public. Once it's done, you don't touch it again.

Everything below happens in your Cloudflare account. You'll need to be signed in.

***

## Step 1 — Point studiobluemli.com at the site

1. Go to Cloudflare and open **Workers & Pages**.
2. Click the **studio-bluemli** worker in the list.
3. Click the **Domains** tab.
4. Click **Add domain**.
5. In the popup, select `studiobluemli.com` from your zones (or type it).
6. Cloudflare will then ask you to pick between:
   - **Custom domains — simple domain mapping** ← pick this one.
   - **Route pattern — advanced URL matching**
7. Confirm.

Why **Custom domains**: this Worker IS the whole site, so we want every request
to `studiobluemli.com` to hit it, with Cloudflare auto-creating the DNS record
and auto-issuing the cert. Route patterns are for the case where a Worker handles
only a slice of a zone (e.g. `/api/*`) and you manage DNS separately — wrong shape
for us.

Cloudflare creates the apex DNS record (proxied) and starts issuing the HTTPS
certificate. Move on to Step 2 — the certificate finishes on its own in a few
minutes.

***

## Step 2 — Redirect www.studiobluemli.com to studiobluemli.com

First add the DNS record so `www.studiobluemli.com` resolves at all (without
this, no redirect rule can fire — there's nothing for Cloudflare to receive):

1. Open the **studiobluemli.com** zone → **DNS** → **Records** → **Add record**.
2. Type **CNAME**, Name **www**, Target `studiobluemli.com`, Proxy status
   **Proxied** (orange cloud), TTL Auto. Save.

Then the redirect rule itself:

1. Stay in the **studiobluemli.com** zone (the domain, not the worker).
2. Click **Rules** in the left sidebar — this lands on the **Overview** page.
3. Click **Create rule**, then **Redirect Rule**.
4. Name the rule `www-to-apex` (any name works).
5. Under **When incoming requests match**, choose **Wildcard pattern**.
6. In the **Request URL** field, paste: `http*://www.studiobluemli.com/*`
7. Under **Then…**, set **Target URL** to: `https://studiobluemli.com/${2}`
8. Set the **Status code** to **301**.
9. Click **Deploy**.

Why `${2}` and not `${1}`: Cloudflare numbers wildcard captures left-to-right
in the order the `*` characters appear. The pattern above has TWO wildcards —
the first `*` is the scheme suffix (matches the `s` in `https`, or empty for
`http`); the second `*` is the path. So `${1}` would be the scheme suffix and
`${2}` is the path. Using `${1}` causes every redirect to land on `/s`, which
is exactly the kind of error that's hard to spot until someone clicks a real
link.

***

## Step 3 — Tell the worker your Umami website ID

This site is Astro, and Astro reads `PUBLIC_*` environment variables at
**build time** (it bakes them into the static HTML during `astro build`).
Cloudflare distinguishes between **build-time** variables (available to the
CI step that runs `astro build`) and **runtime** variables (available to the
running Worker via `env.X`). For an Astro `PUBLIC_*` var, only the build-time
location is correct — runtime won't reach the rendered HTML.

1. Back in **Workers & Pages**, click **studio-bluemli** → **Settings**.
2. Scroll to **Build** → **Build variables and secrets**. (Not the
   **Variables and Secrets** section higher up — that one is runtime-only
   and won't work for this var.)
3. Click **Add**.
4. Set the variable name to: `PUBLIC_UMAMI_WEBSITE_ID`
5. Set the value to the website ID from your Umami Cloud dashboard
   (Umami Cloud → Settings → Websites → studiobluemli.com → copy the ID).
6. Set the type to **Plaintext** — not Secret. This is a public identifier,
   not a credential.
7. Save.
8. Trigger a fresh deploy so the new variable takes effect. The simplest way:
   in the **studio-bluemli** worker page, click **Deployments** at the top and
   then **Trigger deploy** (or push any commit to `main` — Workers Builds
   rebuilds automatically on push).

***

## Step 4 — Wait

Take a coffee break. Cloudflare is finishing the HTTPS certificate. This usually
takes 1–5 minutes. Refreshing won't make it faster.

***

## Step 5 — Check that it all works

When the certificate is ready, you can open `https://studiobluemli.com` and you'll
see the live site. Claude walks a checklist with you to confirm everything works:
sitemap, robots, link previews, Umami events, Lighthouse scores. You only need
to do three checks on your phone (Claude will tell you when):

1. Tap the **DM me on Instagram** button on `/say-hi` — does Instagram open?
2. Tap the **email** link on `/say-hi` — does your email app open with the
   address filled in?
3. Open `studiobluemli.com` over cellular (not wifi) — does it feel fast?

That's it.

***

## What is not done here

A small, browser-level safety feature called HSTS preload makes the site refuse
to ever speak plain HTTP, even on visitors' first visit. The site ships ready for
it, but registering it with browser vendors is intentionally skipped right now —
it's effectively a one-year commitment once submitted. Revisit after the site
has been live for 30 days without issue.

***

*Last updated: 2026-05-15. Filed under operations.*
