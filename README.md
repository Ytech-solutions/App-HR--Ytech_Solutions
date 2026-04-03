# App HR - Ytech Solutions

Application RH moderne construite avec Next.js pour la gestion des employes, des comptes utilisateurs et des acces (IAM/RBAC), avec une base securite orientee production.

## Sommaire

- Presentation
- Fonctionnalites
- Stack technique
- Architecture
- Demarrage rapide
- Variables d'environnement
- IAM et RBAC
- API principales
- Securite
- CI/CD
- Deploiement
- Roadmap securite

## Presentation

Cette application centralise:

- la gestion des employes (CRUD, details, statut),
- la gestion des comptes utilisateurs,
- l'authentification et la gestion de session,
- le controle d'acces par role.

Le projet est structure pour evoluer vers un niveau de maturite securite eleve (OWASP, ISO 27001/27034, RGPD, PCI DSS si paiement).

## Fonctionnalites

- Tableau de bord RH unifie avec vues selon profil.
- Gestion des employes et departements.
- Gestion des comptes (creation, activation/desactivation, reset mot de passe).
- Authentification et session HTTP-only.
- IAM avec roles:
  - `ADMIN`
  - `RH`
  - `EMPLOYE`
- RBAC centralise au niveau middleware API.
- Rate limiting par endpoint sensible.
- Workflow CI avec checks qualite et securite.

## Stack technique

- Framework: `Next.js 16` (App Router)
- UI: `React 19`, `Tailwind CSS`, composants Radix
- Validation: `zod`
- BDD/ORM: `PostgreSQL` + `Prisma`
- Email transactionnel: `nodemailer`
- Securite: headers HTTP, RBAC middleware, rate limiting applicatif
- CI: `GitHub Actions`

## Architecture

- `app/` : routes et API (`app/api/**/route.ts`)
- `components/` : interface utilisateur
- `lib/` : services, IAM, permissions, securite, DB
- `prisma/` : schema et modeles de donnees
- `.github/workflows/ci.yml` : pipeline CI
- `middleware.ts` : controles RBAC + rate limits API

## Demarrage rapide

### Prerequis

- Node.js `>= 20`
- npm `>= 10`
- PostgreSQL accessible via `DATABASE_URL`

### Installation

```bash
npm install
```

### Configuration

Creer un fichier `.env` a la racine (voir section Variables d'environnement).

### Lancer en local

```bash
npm run dev
```

### Build production

```bash
npm run build
npm run start
```

## Variables d'environnement

Variables minimales recommandees:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname

NEXT_PUBLIC_APP_URL=http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

NODE_ENV=development
```

## IAM et RBAC

Les roles applicatifs normalises:

- `ADMIN`: gestion complete (comptes, employes, administration)
- `RH`: gestion RH (sans operations critiques admin)
- `EMPLOYE`: acces limite (profil, consultation)

Une couche de normalisation assure la compatibilite legacy:

- `IT -> ADMIN`
- `CEO -> EMPLOYE`
- `EMPLOYEE -> EMPLOYE`

Le controle d'acces est applique au niveau backend dans `middleware.ts` (non seulement dans l'UI).

## API principales

- Auth:
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `GET /api/auth/session`
  - `POST /api/auth/reset-password`
  - `PUT /api/auth/reset-password`
  - `POST /api/auth/change-password`
- Metier:
  - `/api/employees`
  - `/api/employees/[id]`
  - `/api/departments`
  - `/api/accounts`

## Securite

Le projet integre deja:

- Headers HTTP de securite (`HSTS`, `CSP`, `X-Frame-Options`, etc.).
- Validation stricte des entrees critiques (`zod`).
- Rate limiting sur endpoints sensibles.
- Session cookie `httpOnly`, `secure` (prod), `sameSite`.
- RBAC middleware centralise.
- Audit dependances via `npm run security:audit`.

Consulter `SECURITY.md` pour le detail des controles, du hardening Cloudflare et de la checklist pre-production.

## CI/CD

Pipeline GitHub Actions dans `.github/workflows/ci.yml`:

- `npm ci`
- `npm run lint --if-present`
- `npx tsc --noEmit`
- `npm run build`
- `npm test --if-present`
- `npm run security:audit`

## Deploiement

Recommandations minimales:

- Forcer HTTPS + TLS 1.3.
- Activer Cloudflare WAF + rules OWASP.
- Activer rate limits edge sur endpoints auth.
- Utiliser un secret manager pour les credentials.
- Centraliser les logs securite et alertes.

## Roadmap securite

- Signature/chiffrement fort de session (token signe).
- MFA obligatoire pour roles admin.
- Scan SAST/DAST automatise.
- CodeQL et Dependabot.
- Pentest periodique.

---

Pour la politique de securite complete et les exigences de conformite, voir `SECURITY.md`.
