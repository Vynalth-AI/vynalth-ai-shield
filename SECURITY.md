# Security Policy — Vynalth AI Shield

## Reporting Security Vulnerabilities

At **Vynalth AI Shield**, we take security and data privacy extremely seriously. If you discover a potential security vulnerability in any component of `vynalth-ai-shield` or our API infrastructure, please report it to our security engineering team immediately.

### 🛡️ Reporting Channel
- **Email**: `security@sleepsomno.com`
- **PGP Key**: Available upon request
- **Response Time**: We acknowledge all reports within **24 hours** and aim to provide a remediation plan within **48 hours**.

---

## Safe Harbor & Disclosure Rules

- **Do NOT** test against production user accounts without prior written consent.
- **Do NOT** attempt to execute Denial of Service (DoS) attacks or exfiltrate customer data.
- **Do NOT** publicly disclose any vulnerability until Vynalth AI Shield engineers have investigated and released a patch.

---

## Data Minimization & Zero Sensitive Information

This open-source repository contains **ZERO sensitive credentials, private keys, or PII**.
All environment variables (`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`) must be supplied via secure environment variables or vault secret managers in deployment.

```
Environment Variable Requirements:
- SUPABASE_URL=https://<your-project>.supabase.co
- SUPABASE_ANON_KEY=<your-public-anon-key>
- SHIELD_SECRET_KEY=<your-private-secret-key>
```
