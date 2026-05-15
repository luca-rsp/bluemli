# Content editing guide

How to add or update gallery pieces and pop-ups using GitHub's website. No code knowledge needed. Every change opens a pull request, which gives you a preview URL to check before merging.

---

## What goes where

| Content | Folder |
|---------|--------|
| Gallery pieces | `src/content/gallery/<piece-slug>/` |
| Pop-up events | `src/content/popups/YYYY-MM-DD-<event-slug>.md` |
| Site-wide settings | `src/content/site/config.yaml` |

Each gallery piece lives in its own folder and has two files: an `index.md` with the piece's info, and the photo file (`hero.heic`, `hero.jpg`, etc.).

---

## Adding a new gallery piece

1. Go to the repo on GitHub.com and open the `src/content/gallery/` folder.
2. Click **Add file → Create new file**.
3. In the filename box, type your slug followed by `/index.md` — for example **`cluster-cobalt/index.md`**. The slash creates the folder automatically.
4. Paste the frontmatter template from the [reference card](#frontmatter-reference-card) at the top of the file, between the `---` lines.
5. Fill in the values: `name`, `price`, `status`, `description`, `featured`, and `published_at` (today's date in YYYY-MM-DD format).
6. Choose **Create a new branch** and name it something like `add-cluster-cobalt`.
7. Click **Propose new file**, then **Create pull request**.
8. Wait about 3 minutes for the preview URL to appear in the pull request.
9. Check the preview, then merge.

> **Note on screenshots:** Screenshots of each step will be added after your first real editing session — the written steps above cover everything you need for now.

---

## Uploading the photo

1. Open the new folder you created (e.g., `src/content/gallery/cluster-cobalt/`) on GitHub.com.
2. Click **Add file → Upload files**.
3. Drag your photo into the upload area. HEIC works — no conversion needed.
4. **Renaming the file:** GitHub keeps your file's original name when you upload it. After uploading, click the file name and use "Rename" (top-right of the file view) to change it to `hero.heic` (or `hero.jpg` / `hero.jpeg` / `hero.png` matching your file's extension). Capital letters work too — `Hero.HEIC` is fine; the build handles any letter-case.
5. Choose the same branch you used for the `index.md`.

---

## Editing an existing piece

1. Open the piece's folder in `src/content/gallery/` on GitHub.com.
2. Click `index.md`, then the pencil icon to edit.
3. Change whatever you need.
4. Choose **Create a new branch**, give it a name, and click **Propose changes**.
5. Open a pull request, check the preview, and merge.

---

## Marking a piece as sold

1. Open the piece's `index.md` as described above.
2. Change `status: available` to `status: sold`.
3. Propose the change on a new branch → pull request → preview → merge.

The piece stays in the gallery with a quiet "Sold" label. It stays as part of the portfolio history.

---

## Never delete a piece (flip availability instead)

Gallery pieces are a portfolio archive. Deleting a piece permanently removes it from the site's history.

**Always flip the `status` field instead of deleting:**

| Situation | Status to use |
|-----------|---------------|
| Piece has found a home | `sold` |
| One of a kind, want to highlight that | `one-of-one` |
| Soft hold for someone | `reserved` |
| Back on the table | `available` |

Never delete a piece's folder. Change the status instead.

---

## Adding a pop-up event

1. Open `src/content/popups/` on GitHub.com.
2. Click **Add file → Create new file**.
3. Name the file with today's date and the event name: `2026-06-15-nopa-block-party.md`.
4. Paste the pop-up frontmatter template from the [reference card](#frontmatter-reference-card) at the top.
5. Fill in the values.
6. Below the closing `---` of the frontmatter, write the event description in plain prose — this is the body of the file. (The description goes in the body, not in the frontmatter — that is how the schema works.)
7. Create a branch, open a pull request, preview, and merge.

---

## Frontmatter reference card

### Gallery piece (`src/content/gallery/<slug>/index.md`)

```
---
name: Cobalt cluster
hero: ./hero.heic
price: 52
status: available
description: bright cobalt and cream glass beads, hand-clustered into a pair that wears every day
featured: true
published_at: "2026-05-13"
---
```

| Field | Example | Notes |
|-------|---------|-------|
| `name` | Cobalt cluster | Short, sentence case, follows the studio's brand voice (the CI brand-check will tell you if a word is off-brand) |
| `hero` | `./hero.heic` | The photo file in the same folder. HEIC, JPG, JPEG, or PNG. Any letter-case works — `HERO.HEIC` is fine |
| `price` | `52` | Whole-number USD, no dollar sign |
| `status` | `available` | One of: `available`, `sold`, `one-of-one`, `reserved` |
| `description` | bright cobalt and cream glass beads... | One sentence, sentence case, follows brand voice |
| `featured` | `true` | `true` = eligible for the landing-page carousel |
| `published_at` | `"2026-05-13"` | YYYY-MM-DD in quotes — sets the sort order on the gallery page (newest first) |

### Pop-up event (`src/content/popups/YYYY-MM-DD-slug.md`)

```
---
name: NoPa Block Party
date: "2026-06-15"
start_time: "10:00"
end_time: "14:00"
tz: America/Los_Angeles
location: NoPa Block Party
---

Write your event description here, below the closing ---. This is the body of the file.
It can be as long as you want — a sentence or a few paragraphs.
```

| Field | Example | Notes |
|-------|---------|-------|
| `name` | NoPa Block Party | The event's name |
| `date` | `"2026-06-15"` | YYYY-MM-DD in quotes, the day of the event |
| `end_date` | `"2026-06-16"` | Optional — only needed for multi-day events |
| `start_time` | `"10:00"` | Start time in Pacific |
| `end_time` | `"14:00"` | End time in Pacific |
| `tz` | `America/Los_Angeles` | Defaults to Pacific — usually leave as-is |
| `location` | NoPa Block Party | Venue name and neighborhood |
| `address` | Divisadero & Hayes | Optional — useful for map links |
| `photos` | (see note) | Optional — an array of image refs if you want to attach event photos |
| `link` | `https://…` | Optional — RSVP or event page URL |

The event description goes in the **body** of the file (below the closing `---`), not in the frontmatter. Leave it blank if you have nothing to say yet.

---

## Troubleshooting

**The build failed**

Open the pull request and click the **Checks** tab. Look for a red mark. The error names the field with the problem. For example:

- `Unrecognized key 'availabilty'` means the field name has a typo — the actual field is `status` — change it to `status: sold` (or one of the four allowed values: `available`, `sold`, `one-of-one`, `reserved`).
- `Expected type "number", received "string"` on `price` means the value has quotes around it — use `price: 52` not `price: "52"`.
- `Invalid enum value` on `status` means the value is not one of the four allowed options — double-check the spelling.

**The photo didn't show up**

Make sure the photo is in the same folder as the piece's `index.md`, and that it is named `hero.heic`, `hero.jpg`, `hero.jpeg`, or `hero.png` (any letter-case works). The preview deploy takes about 3 minutes after you merge.

**The preview URL isn't showing up in the pull request**

Give it up to 5 minutes. If it still doesn't appear, check the **Checks** tab for build errors.

***

## Analytics events

The site records a small number of click events into Umami Cloud (cookieless,
no consent banner). Page-load events (which pages people visit) are always
recorded by Umami automatically — no setup needed. The named events below are
specific clicks worth knowing about, with Umami's page URL recorded alongside
each event so you can see "footer IG clicks from the gallery page" vs "footer
IG clicks from the home page" without any extra tagging.

| Event | Fires when | Where |
|-------|------------|-------|
| `gallery_card_click` | Visitor opens a gallery piece from the gallery grid | `/gallery` cards |
| `inquire_ig_per_piece` | Visitor taps the "DM me to inquire" link on a piece page (the `piece` property captures which slug) | `/gallery/<slug>` IG CTA |
| `say_hi_ig_dm` | Visitor taps the IG DM button on Say hi | `/say-hi` |
| `say_hi_mailto` | Visitor taps the email link on Say hi | `/say-hi` |
| `footer_ig_click` | Visitor taps the IG handle in the footer | every page (footer) |
| `popups_empty_ig_click` | Visitor taps "follow @studio_bluemli for the next one" when no pop-ups are on the calendar | `/popups` empty state |

To see them: log into Umami Cloud → studiobluemli.com → **Events** tab.

---

## Operations

When the site is ready for the public and you want to put it on `studiobluemli.com`,
follow the one-time steps in [SETUP-DNS.md](SETUP-DNS.md). It's a 15-minute walk-through
of the Cloudflare dashboard. You only do it once.
