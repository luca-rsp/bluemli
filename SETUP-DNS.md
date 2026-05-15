# Going live with studiobluemli.com

This is a one-time setup. It takes about 15 minutes. You only do this when the
site is ready for the public. Once it's done, you don't touch it again.

Everything below happens in your Cloudflare account. You'll need to be signed in.

***

## Step 1 — Point studiobluemli.com at the site

1. Go to Cloudflare and open **Workers & Pages**.
2. Click the **studio-bluemli** worker in the list.
3. Click **Settings** at the top.
4. Find the **Domains & Routes** section and click **Add**, then **Custom Domain**.
5. Type `studiobluemli.com` (no `https`, no slashes — just the name).
6. Click **Add Custom Domain**.

Cloudflare creates the DNS record and starts issuing the HTTPS certificate. Move
on to Step 2 — the certificate finishes on its own in a few minutes.

***

## Step 2 — Redirect www.studiobluemli.com to studiobluemli.com

1. Go to Cloudflare and open the **studiobluemli.com** zone (the domain itself,
   not the worker).
2. Click **Rules** in the left sidebar, then **Redirect Rules**.
3. Click **Create rule**.
4. Name the rule `www-to-apex` (any name works).
5. Under **When incoming requests match**, choose **Wildcard pattern**.
6. In the request URL field, paste: `http*://www.studiobluemli.com${URI}`
7. Under **Then…**, set **Target URL** to: `https://studiobluemli.com${URI}`
8. Set the **Status code** to **301**.
9. Click **Deploy**.

The `${URI}` part keeps the path — so `www.studiobluemli.com/gallery` lands on
`studiobluemli.com/gallery`, not the homepage.

***

## Step 3 — Tell the worker your Umami website ID

1. Back in **Workers & Pages**, click **studio-bluemli** → **Settings**.
2. Scroll to **Variables and Secrets**.
3. Click **Add**.
4. Set the variable name to: `PUBLIC_UMAMI_WEBSITE_ID`
5. Set the value to the website ID from your Umami Cloud dashboard
   (Umami Cloud → Settings → Websites → studiobluemli.com → copy the ID).
6. Set the type to **Plaintext** — not Secret. This is a public identifier,
   not a credential.
7. Save.
8. Trigger a fresh deploy so the new variable takes effect. The simplest way:
   in the **studio-bluemli** worker page, click **Deployments** at the top and
   then **Trigger deploy**.

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
