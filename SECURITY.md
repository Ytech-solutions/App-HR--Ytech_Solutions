# Security Policy & Baseline

Ce document decrit la politique de securite de l'application, les controles techniques implementes et les exigences operationnelles pour la production.

## 1) Objectif

Objectifs principaux:

- proteger la confidentialite, l'integrite et la disponibilite des donnees RH;
- reduire la surface d'attaque applicative et infrastructure;
- assurer une conformite continue (OWASP, ISO, RGPD, PCI DSS si necessaire);
- maintenir une posture securite verifiable (CI, audit, logs).

## 2) Referentiels cibles

- OWASP Top 10
- OWASP ASVS
- ISO/IEC 27034 (securite applicative by design)
- ISO/IEC 27001 (gouvernance SSI)
- RGPD
- PCI DSS (si traitement de donnees de paiement)

## 3) Controles implementes (code applicatif)

- Headers HTTP de securite:
  - `Strict-Transport-Security`
  - `Content-Security-Policy`
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
- Suppression de `X-Powered-By`.
- Validation stricte des inputs critiques via `zod`.
- Rate limiting applicatif sur endpoints sensibles (`login`, `reset-password`).
- Session cookie securisee (`httpOnly`, `secure` en prod, `sameSite` strict, duree reduite).
- IAM + RBAC centralise dans `middleware.ts`.
- Hash des mots de passe via `bcrypt`.
- CI securite: audit dependances (`npm run security:audit`).

## 4) Exigences IAM et controle d'acces

Roles applicatifs:

- `ADMIN`
- `RH`
- `EMPLOYE`

Principes:

- moindre privilege;
- separation des taches;
- controles d'acces cote backend (pas uniquement UI);
- desactivation rapide des comptes inactifs/compromis;
- MFA obligatoire pour profils privilegies (production).

## 5) Exigences infrastructure (production)

### Transport et chiffrement

- HTTPS obligatoire.
- TLS minimum: `1.3`.
- certificats valides + renouvellement automatique.

### Chiffrement des donnees au repos

- chiffrement AES-256 (ou equivalent fournisseur cloud).
- sauvegardes chiffrees, testees regulierement.
- rotation des secrets (DB, SMTP, API keys, tokens).

### WAF / DDoS / bot protection

- WAF active (regles managed + OWASP).
- anti-bot actif.
- rate limiting edge sur endpoints auth et sensibles.

## 6) Configuration Cloudflare recommandee

- SSL/TLS:
  - encryption mode: `Full (strict)`
  - minimum TLS: `1.3`
  - TLS 1.3: `On`
- Edge certificates:
  - `Always Use HTTPS`: `On`
  - `HSTS`: `On` (avec preload selon politique)
  - `Automatic HTTPS Rewrites`: `On`
- WAF:
  - Managed ruleset: `On`
  - OWASP ruleset: `On` (mode block)
- Rate limiting edge:
  - `POST /api/auth/login`: `8 req / 15 min / IP` (block 15 min)
  - `POST /api/auth/reset-password`: `5 req / 15 min / IP` (block 15 min)
  - `PUT /api/auth/reset-password`: `10 req / 15 min / IP` (block 15 min)

## 7) Journalisation, monitoring et reponse incident

- centraliser les logs applicatifs et securite;
- activer alerting sur:
  - echec de login repetes,
  - pics de 4xx/5xx,
  - activite anormale sur endpoints sensibles;
- conserver des traces exploitables pour investigation;
- documenter une procedure de reponse incident (triage, containment, remediation, post-mortem).

## 8) Secure SDLC

- patching regulier (correctifs critiques en priorite immediate);
- scans de dependances (CI + monitoring continu);
- revue de code securite pour changements critiques;
- tests de securite periodiques (SAST/DAST/pentest);
- validation pre-release via checklist securite.

## 9) Conformite

### RGPD

- minimisation des donnees;
- base legale et registre de traitements;
- politique de retention/suppression;
- droits des personnes (acces, rectification, suppression, portabilite);
- DPA avec sous-traitants.

### PCI DSS (si applicable)

- ne jamais stocker PAN/CVV en clair;
- tokenisation via PSP conforme;
- segmentation du scope PCI;
- journalisation et monitoring renforces.

## 10) Politique de divulgation de vulnerabilites

Pour signaler une vulnerabilite:

- ne pas publier publiquement avant correction;
- transmettre les details techniques, etapes de reproduction et impact;
- fournir un canal prive dedie (email securite interne).

## 11) Checklist pre-production

- [ ] HTTPS force et TLS 1.3 verifie
- [ ] WAF + OWASP rules actives
- [ ] Rate limiting edge et applicatif verifies
- [ ] IAM/RBAC teste par role
- [ ] MFA active pour profils admin
- [ ] Secrets en coffre-fort (pas dans le repo)
- [ ] Sauvegardes chiffrees + test restauration
- [ ] CI verte (lint, build, audit securite)
- [ ] Aucun package critique non corrige
- [ ] Logs securite et alerting operationnels
