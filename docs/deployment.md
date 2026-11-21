# Deployment

Nobody deploys by hand. Deploys happen from Git through Vercel.

| Git action | What happens |
|---|---|
| Open a pull request | GitHub Actions runs lint, type-check, build and a security audit (`.github/workflows/ci.yml`). Vercel builds a preview link |
| Merge to `main` | Vercel deploys to production: https://www.teambullfuelhouse.com |
| Merge to `develop` (once created) | Vercel preview/staging deployment |

## Branches and commits

- `main` is production. Do not push to it directly: open a pull request.
- Work on `feature/…`, `fix/…` or `hotfix/…` branches.
- Commit messages use `type: message`, with type one of `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.

## Releases

1. Merge the pull requests for the release and check the CI is green.
2. Add an entry to `CHANGELOG.md`.
3. Tag the release on `main` with the next version (`v1.0.1` for fixes, `v1.1.0` for new features, `v2.0.0` for big changes).

## Environment variables in Vercel

Vercel project → Settings → Environment Variables. Set `GOOGLE_SHEET_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` and `SESSION_SECRET`:

- **Production:** the production sheet
- **Preview:** the staging sheet (see [google-sheet.md](google-sheet.md))

After changing a variable, redeploy.

## First-time setup

See [setup-accounts-and-stock.md](setup-accounts-and-stock.md) for creating the sheet, the service account and the first admin.
