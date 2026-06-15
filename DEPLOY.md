# Deploying the backend (free tier)

This is the step-by-step for **Render (backend) + Neon (Postgres)**, the cheapest combo that handles 500 MB video uploads and long-running requests in 2026. Total cost: ₹0/month if you stay under Neon's 0.5 GB storage and Render's free hours.

Everything lives in [`render.yaml`](render.yaml) at the repo root. You only need to fill values once.

---

## 1. Postgres on Neon (5 minutes)

1. Sign up at https://neon.tech (GitHub OAuth is fastest)
2. **Create project** → name `borda-event`, region `Singapore` (closest free region to Surat)
3. On the project dashboard → **Connection details** → toggle **"Pooled connection"** (recommended for Render's connection limits)
4. You'll see something like:
   ```
   postgresql://user:password@ep-xxx-pooler.aws.neon.tech/neondb?sslmode=require
   ```
   Parse it into 5 env vars (you'll paste these into Render in step 2):
   ```
   DB_HOST     = ep-xxx-pooler.aws.neon.tech
   DB_PORT     = 5432
   DB_USERNAME = user
   DB_PASSWORD = password
   DB_NAME     = neondb
   DB_SSL      = true            ← already pre-set in render.yaml
   ```
   `DB_SSL=true` is hardcoded in `render.yaml`'s envVars section, so it gets
   set automatically — you only need to paste the 4 connection details.

That's it for Neon. The migrations apply automatically on first Render deploy.

> **Already done if you ran this from local:** the 6 migrations + seed (60
> permissions, Super Admin role, default `admin@admin.com / password` user)
> have already been applied. The build's `db:migrate` step will run again
> on Render but is idempotent — it sees the existing
> `drizzle.__drizzle_migrations` table and skips everything.

---

## 2. Backend on Render (10 minutes)

1. Push the current branch (which contains `render.yaml`) to GitHub:
   ```bash
   git add render.yaml DEPLOY.md
   git commit -m "chore: Add Render Blueprint + Deploy Guide"
   git push
   ```

2. Sign up at https://render.com (GitHub OAuth)

3. **Dashboard → New → Blueprint** → connect the `yashborda/borda-event-monorepo` repo → Render auto-detects `render.yaml` and shows the `borda-event-backend` service

4. **Fill in the env vars Render asks for** (the ones marked `sync: false`):

   | Variable | Where to get it |
   | --- | --- |
   | `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | From Neon (step 1) |
   | `GOOGLE_OAUTH_CLIENT_ID` | Copy from `apps/backend/.env` |
   | `GOOGLE_OAUTH_CLIENT_SECRET` | Copy from `apps/backend/.env` |
   | `GOOGLE_OAUTH_REFRESH_TOKEN` | Copy from `apps/backend/.env` |
   | `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Copy from `apps/backend/.env` |
   | `MAIL_HOST` | `smtp.resend.com` (after step 3) |
   | `MAIL_USER` | `resend` |
   | `MAIL_PASSWORD` | Resend API key (after step 3) |
   | `MAIL_FROM` | `Borda Event <noreply@yourdomain.com>` |
   | `APP_URL` | **Leave blank for now**, fill after first deploy |
   | `ADMIN_URL` | Your admin's URL (Vercel deploy URL, or temporarily `http://localhost:3001`) |
   | `WEBSITE_URL` | Your website's URL (Vercel deploy URL, or temporarily `http://localhost:3000`) |

5. Click **Apply** → Render starts the first build. Watch the logs:
   - `corepack enable` → enables pnpm
   - `pnpm install --frozen-lockfile` → ~2 minutes (cold cache)
   - `pnpm --filter backend build` → ~1 minute
   - `pnpm --filter backend db:migrate` → migrations 0000 through 0005 apply to Neon
   - Service goes "Live" → URL appears at the top, e.g. `https://borda-event-backend.onrender.com`

6. **Set `APP_URL` to that URL.** Go back to the env vars panel, set `APP_URL = https://borda-event-backend.onrender.com`, click **Save & Deploy** to restart with the new value. (Without this, Render-generated absolute URLs in emails/sitemaps point at `http://localhost:3002`.)

7. **Verify** by visiting `https://<your-backend>.onrender.com/api/health` — you should get a JSON 200.

---

## 3. Mail on Resend (5 minutes, optional but recommended)

The NestJS backend's config schema requires `MAIL_*` env vars to be set, even if no transactional emails are sent yet. Cheapest free path:

1. Sign up at https://resend.com (GitHub OAuth)
2. **API Keys → Create API Key** → name `borda-event-backend` → copy the `re_...` value
3. **Domains → Add domain** → enter `bordaevent.com` (or your domain) → add the 3 DNS records Resend shows
   - If you don't have the domain yet, you can use Resend's onboarding sandbox sender for testing
4. In Render's env vars: `MAIL_HOST=smtp.resend.com`, `MAIL_USER=resend`, `MAIL_PASSWORD=<the re_... key>`, `MAIL_FROM=Borda Event <noreply@bordaevent.com>`

Alternative: **Gmail SMTP** with an App Password (free, but capped at 100/day):
- `MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=465`, `MAIL_USER=bordaevent@gmail.com`, `MAIL_PASSWORD=<16-char app password>`

---

## 4. Deploy the admin + website (Vercel — separate, also free)

The two Next.js apps deploy best on Vercel. One project per app:

| App | Vercel project | Root Directory setting |
| --- | --- | --- |
| `apps/admin` | `borda-event-admin` | `apps/admin` |
| `apps/website` | `borda-event-website` | `apps/website` |

For each project:

1. **Add New → Project** → import the same GitHub repo
2. **Root Directory** → set to `apps/admin` (or `apps/website`)
3. **Framework Preset** → Next.js (auto-detected)
4. **Build Command** → `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter <app-name> build`
5. **Output Directory** → `.next`
6. **Install Command** → `echo "skipped — installed at root"`
7. **Environment variables** (for admin):
   - `NEXT_PUBLIC_BACKEND_DIRECT_URL` = your Render backend URL (so video uploads bypass the Next dev proxy → goes direct to Render in prod too)
   - `NEXT_PUBLIC_ENVIRONMENT` = `production`
   - `NEXT_PUBLIC_SITE_URL` = your admin's Vercel URL
8. **Deploy**

After both Vercel deploys are up:
- Go back to Render → update `ADMIN_URL` and `WEBSITE_URL` env vars on the backend to the real Vercel URLs
- Restart the Render service

---

## What to expect after deploy

| | Free-tier behaviour |
| --- | --- |
| **Cold start** | ~30 s on first request after 15 min idle. Subsequent requests in that session are instant. Acceptable for admin-only traffic. |
| **Render uptime** | 750 hrs/month free (effectively always-on if traffic is light) |
| **Neon storage** | 0.5 GB free. Your migrations + admin user + a few hundred service themes/media rows are well under that. |
| **Drive storage** | Counts against your personal Google account's 100 GB plan. Each themed event upload (~50 photos + 10 videos) is roughly 500 MB. |
| **Mail** | Resend: 3000 emails/month free. Gmail SMTP: 100/day. |
| **Filesystem** | **Ephemeral.** Anything written to `apps/backend/uploads/` is wiped on every deploy. New uploads go to Drive (intentional). The single legacy local-disk image (your original Baby Shower cover) will 404 — re-upload it via the admin to push it to Drive. |

---

## Common issues

- **Build OOMs at `pnpm install`** — rare but possible on free 512 MB. Workaround: switch the build to `pnpm install --filter "backend..." --frozen-lockfile` to skip admin/website deps (Render needs only backend's runtime tree).
- **Migrate fails on first deploy with "permission denied"** — Neon's free tier sometimes restricts CREATE EXTENSION. The `gen_random_uuid()` call in `0000_initial.sql` needs `pgcrypto`. Neon usually has it pre-installed; if migrate complains, run `CREATE EXTENSION IF NOT EXISTS pgcrypto;` once in the Neon SQL editor.
- **CORS errors from admin** — confirm `ADMIN_URL` in Render env exactly matches the admin's Vercel URL (no trailing slash, https scheme).
- **OAuth refresh token revoked after 7 days** — happens if the OAuth consent screen is still in "Testing" mode in Google Cloud Console. Go to **Auth Platform → OAuth consent screen → Publishing status → Publish App** (no verification needed for personal-Drive scopes). The current refresh token survives the change.

---

## When you outgrow free tier

Likely first ceilings, in order:
1. **Drive quota** (100 GB) — upgrade to Google One 200 GB (~₹130/month)
2. **Neon storage** (0.5 GB) — upgrade to Neon Launch ($19/month for 10 GB)
3. **Render cold starts annoy clients** — upgrade to Render Starter ($7/month for always-on)

Total at that scale: ~₹3000/month for a real production setup.
