# Deploying this site

This is a plain static site (HTML/CSS/JS) — no build step, no server. That
means GitHub Pages can host it for free, and everything below is one-time
setup, not ongoing maintenance.

---

## 1. Create a GitHub account

1. Go to [github.com](https://github.com) → **Sign up**
2. Enter an email, password, and username → verify your email
3. Turn on **two-factor authentication** (Settings → Password and
   authentication) — this is the one real security step for a static
   site like this, since there's no server to "hack," just an account
   to protect.

## 2. Create a repository

1. Click **+** (top right) → **New repository**
2. Name it `yourusername.github.io` if you want the site at that exact
   address, or anything else if you're using a custom domain anyway
3. Set visibility to **Public** (required for free GitHub Pages)
4. Click **Create repository**

## 3. Upload your site files

1. On the repo page: **Add file** → **Upload files**
2. Drag in everything: `index.html`, `style.css`, `script.js`, and the
   `content/`, `admin/`, `advertisement/` folders
3. **Commit changes**

## 4. Turn on GitHub Pages

1. Repo → **Settings** → **Pages**
2. Source: **Deploy from a branch** → Branch: **main** → folder **/ (root)**
   → **Save**
3. Your site goes live at `https://yourusername.github.io/reponame/`
   within a minute or two

## 5. Edit your content

- **Posts**: `content/posts.json`
- **Ads**: `content/ads.json`
- **Usernames/links** (YouTube, Facebook, TikTok, Instagram, X, email):
  `content/social.json` — this is the only place you need to type each
  username; it updates the featured strip, the Elsewhere tabs, the
  footer, and the "follow us" ticker automatically
- Or edit all of the above through **`/admin`** once Decap CMS is
  connected (see Section 8)

### Image sizes

| Image | Recommended size | Notes |
|---|---|---|
| Banner (`banner-img`) | **1600×700px** or larger, similar wide aspect ratio | Cropped to fill, so anything close to this ratio works |
| Post ads (`postAd1`–`postAd4`) | **1000×220px** | Wide horizontal strip — displayed at up to 220px tall |
| Sidebar/rotating ads (`mainAds`) | **300×600px** | Tall "skyscraper" ratio — fills the sidebar box, cropped if needed |

Any image works even if it's not this exact size — these are just the
proportions the layout is built around, so nothing looks stretched or
awkwardly cropped.

---

## 6. Connect your own domain

Skip this section if you're happy with the free `github.io` address.

### Step A — Buy a domain

From any registrar (Namecheap, Google Domains, GoDaddy, etc.) — or
through Cloudflare Registrar directly if you're using Cloudflare anyway.

### Step B — Point the domain at GitHub Pages using Cloudflare

1. Create a free [Cloudflare](https://cloudflare.com) account
2. **Add a site** → enter your domain → Cloudflare scans existing DNS
   records
3. Cloudflare gives you two nameservers (e.g. `bob.ns.cloudflare.com`) —
   go to your domain registrar's settings and replace the existing
   nameservers with these two. This can take a few hours to propagate.
4. Back in Cloudflare, go to **DNS** → **Records** and add:

   For the root domain (`example.com`) — four **A** records, all
   pointing to GitHub's IP addresses:
   ```
   Type: A   Name: @   Content: 185.199.108.153
   Type: A   Name: @   Content: 185.199.109.153
   Type: A   Name: @   Content: 185.199.110.153
   Type: A   Name: @   Content: 185.199.111.153
   ```

   For the `www` subdomain — one **CNAME** record:
   ```
   Type: CNAME   Name: www   Content: yourusername.github.io
   ```

5. Set the **Proxy status** to "DNS only" (grey cloud, not orange) on
   these records at first — GitHub Pages needs to verify the domain
   before Cloudflare's proxy/CDN layer sits in front of it. You can
   switch it to "Proxied" (orange cloud) afterward once it's verified.

### Step C — Tell GitHub about the domain

1. Repo → **Settings** → **Pages** → **Custom domain** → enter your
   domain → **Save**
2. GitHub automatically creates a `CNAME` file in your repo — don't
   delete it
3. Check **Enforce HTTPS** once GitHub finishes issuing a certificate
   (can take up to 24 hours, usually much faster)

### Step D — Turn Cloudflare's proxy back on (optional but recommended)

Once the domain works over plain GitHub Pages, go back to the DNS
records in Cloudflare and switch the proxy status to "Proxied" (orange
cloud). This routes traffic through Cloudflare for free CDN caching and
extra protection, while GitHub Pages still serves the actual files.

---

## 7. GitHub Pages doesn't process the fetch() calls itself — heads up

This site loads `content/posts.json`, `content/ads.json`, and
`content/social.json` at runtime with `fetch()`. That only works over
`http://` or `https://` — opening `index.html` by double-clicking it
(`file://...`) will show placeholder content instead, because browsers
block that for local files. Once it's on GitHub Pages (or any real web
server), this isn't an issue.

## 8. Setting up Decap CMS (optional, for the `/admin` editing panel)

1. In `admin/config.yml`, replace `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME`
   with your actual repo path
2. Create a **GitHub OAuth App**: your GitHub profile picture →
   **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**
3. Deploy a small free OAuth proxy — GitHub Pages can't complete a login
   handshake on its own, so Decap needs a tiny go-between service. Decap's
   own documentation lists current ready-made options for this (a few
   minutes to set up on a free tier of something like Cloudflare Workers
   or Vercel)
4. Once connected, visit `https://yourdomain.com/admin/` to edit posts,
   ads, and social links through a form instead of raw JSON

---

## Quick troubleshooting

- **Blank page / content not loading**: check you're viewing it through
  a real URL (`https://...`), not a local file
- **YouTube embed shows an error**: double-check the video ID is correct
  and that the video isn't set to private
- **Facebook Page Plugin shows nothing**: the Facebook Page must be
  public, and the username in `content/social.json` must match the
  Page's actual URL slug
- **Custom domain shows a GitHub 404**: DNS hasn't finished propagating
  yet (can take up to 24–48 hours), or the `CNAME` file got removed —
  check Settings → Pages still shows your domain
