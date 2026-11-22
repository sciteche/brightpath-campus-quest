# Deploying BrightPath Classes

The project has two build outputs:

| Command                | Output           | Use                                                                 |
| ---------------------- | ---------------- | ------------------------------------------------------------------- |
| `bun run build`        | `.output/`       | Lovable / Cloudflare (SSR worker) — what Lovable deploys itself      |
| `bun run build:static` | `dist/`          | Fully static site for GitHub Pages, Hostinger, or any file host      |

`dist/` is self-contained and relocatable: it works at the root of a domain
**and** from a sub-folder (asset paths are relative and the router detects its
base folder at runtime). It already includes:

- `index.html` — prerendered page with all SEO tags
- `404.html` — copy of `index.html` so unknown URLs still load the app (GitHub Pages)
- `.nojekyll` — tells GitHub Pages to serve files verbatim
- `.htaccess` — tells Apache hosts (Hostinger) to rewrite unknown paths to `index.html`

> npm users: every `bun run <script>` below also works as `npm run <script>`.

## GitHub Pages (automatic, free)

A workflow at `.github/workflows/deploy-pages.yml` builds and deploys on every
push to `main`.

One-time setup:

1. On GitHub open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the Actions tab).

The site publishes to `https://<your-user>.github.io/brightpath-campus-quest/`.

## Hostinger (upload `dist/` to `public_html`)

1. Build locally:

   ```bash
   bun install
   bun run build:static
   ```

2. Open Hostinger's **hPanel → Files → File Manager** (or connect with FTP/SFTP
   using the credentials from hPanel).
3. Open the `public_html` folder of your domain.
4. Upload the **contents** of `dist/` (not the folder itself) into
   `public_html`: `index.html`, `404.html`, `.htaccess`, `.nojekyll`,
   `favicon.*`, `og-image.png`, `robots.txt`, `sitemap.xml` and the `assets/`
   folder.
   - Tip: zip the contents of `dist/`, upload the zip, and use File Manager's
     **Extract** — much faster than uploading files one by one.
   - Make sure hidden files (`.htaccess`, `.nojekyll`) are included; enable
     "show hidden files" in File Manager to check.
5. Visit your domain. Done — there is no server-side step; it is plain static
   hosting.

A sub-folder works too (e.g. `public_html/campus/` → `yourdomain.com/campus/`);
no configuration change is needed.

## When the site moves to its own domain

The absolute URLs used by SEO tags default to the GitHub Pages address. After
pointing a real domain at the site, update them in three places and rebuild:

1. `src/lib/site.ts` — `SITE_URL`
2. `public/robots.txt` — the `Sitemap:` line
3. `public/sitemap.xml` — the `<loc>` entry

Also replace the placeholder street address in `src/routes/index.tsx`
(JSON-LD) and the placeholder WhatsApp number in `src/game/booking.ts` before a
real launch.

## Lovable stays in charge of its own deployment

Nothing above affects Lovable: `bun run build` still produces the Cloudflare
SSR output Lovable expects, and the static build only activates when
`scripts/build-static.mjs` sets `BRIGHTPATH_STATIC_BUILD=1`.
