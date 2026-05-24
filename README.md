# Journal

A personal book-writing app. Write chapters, manage pages, and export print-ready PDFs — all from the browser. Built with Next.js, Better Auth (Google OAuth), SQLite, and Docker.

---

## Features

- 📖 Create and manage multiple books
- 🗂️ Organize content into chapters and pages
- 🖨️ Print-ready export with configurable trim sizes (Trade, A5, Mass Market, etc.) and font presets
- 🔐 Google OAuth via Better Auth
- 🐳 Self-hosted via Docker on a single GCP VM

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, TypeScript |
| Auth | Better Auth + Google OAuth |
| Database | SQLite (better-sqlite3) |
| Container | Docker + Docker Compose |
| Infra | GCP (Terraform) |
| CI/CD | GitHub Actions → GHCR → SSH deploy |

---

## Local Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Copy and fill in environment variables
cp .env.example .env.local
# Set: BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_APP_URL

# 3. Run database migrations
npm run db:migrate

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_SECRET` | Random secret for Better Auth session signing |
| `BETTER_AUTH_URL` | Full URL of the app (e.g. `https://yourdomain.com`) |
| `NEXT_PUBLIC_APP_URL` | Same as above, exposed to the client |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `DB_PATH` | Path to the SQLite database file (default: `/app/db/journal.db`) |

---

## Infrastructure

The app runs on a single GCP `e2-micro` VM provisioned with Terraform.

```bash
cd infra

# Copy and fill in variables
cp terraform.tfvars.example terraform.tfvars

# Provision
terraform init
terraform apply
```

### Required `terraform.tfvars` values

```hcl
project_id          = "your-gcp-project-id"
ssh_public_key_path = "~/.ssh/id_ed25519.pub"
```

---

## Deployment

Deployments are triggered manually via the **Deploy** GitHub Actions workflow (`Actions → Deploy → Run workflow`).

### How it works

1. Builds and pushes a Docker image to GHCR
2. Copies `docker-compose.yml` to the server over SSH
3. Pulls the new image and restarts the container

### GitHub Actions Secrets (required)

| Secret | Description |
|--------|-------------|
| `DEPLOY_HOST` | Server IP address |
| `DEPLOY_USER` | SSH user on the server (`deploy`) |
| `DEPLOY_SSH_KEY` | Private SSH key whose public key is in `/home/deploy/.ssh/authorized_keys` |
| `NEXT_PUBLIC_APP_URL` | App URL |
| `AUTH_SECRET` | Better Auth secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SLACK_WEBHOOK_URL` | *(Optional)* Slack webhook for deploy notifications |

### First-time server setup

After provisioning with Terraform, add the deploy key to the server:

```bash
# SSH in via Cloud Shell
gcloud compute ssh journal-server --project=YOUR_PROJECT --zone=us-central1-a

# Add the public key matching your DEPLOY_SSH_KEY secret
sudo mkdir -p /home/deploy/.ssh
echo "ssh-ed25519 AAAA..." | sudo tee /home/deploy/.ssh/authorized_keys
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
```

---

## Contributing

Contributions are welcome!

### Getting started

1. **Fork** the repository and clone your fork
2. **Create a branch** for your change:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes** and ensure the app runs locally
4. **Lint** before committing:
   ```bash
   cd frontend && npm run lint
   ```
5. **Commit** using conventional commits:
   ```
   feat: add export to epub
   fix: correct page numbering on spread view
   chore: update dependencies
   ```
6. **Open a pull request** against `main` with a clear description of what and why

### Guidelines

- Keep PRs focused — one feature or fix per PR
- For significant changes, open an issue first to discuss the approach
- Do not commit `.env*` files, secrets, or `terraform.tfvars`
- SQLite schema changes must include a migration via `npm run db:migrate`

### Project structure

```
frontend/        # Next.js app
  src/
    app/         # Routes & API handlers
    components/  # React components (BookPage, BookSpread, Sidebar)
    lib/         # Auth, DB, types, utilities
infra/           # Terraform (GCP)
.github/
  workflows/
    deploy.yml   # Build & deploy workflow
docker-compose.yml
```

---

## License

[MIT](LICENSE)
