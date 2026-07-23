# Contributing to Vynalth AI Shield

Thank you for considering contributing to **Vynalth AI Shield** (`https://github.com/Vynalth-AI/vynalth-ai-shield`)!

## 🚨 Critical Security & Privacy Rule

**NEVER commit real API secret keys, database passwords, tokens, or private user telemetry to git.**

Always use mock placeholder keys in documentation and tests:
- Public Key format: `vms_pub_live_your_public_site_key`
- Secret Key format: `vms_sec_live_your_private_secret_key`

---

## 🛠️ Development Setup

```bash
# 1. Clone repository
git clone https://github.com/Vynalth-AI/vynalth-ai-shield.git
cd vynalth-ai-shield

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Verify build & TypeScript type checking
npm run build
```

---

## 🧪 Testing Guidelines

Before opening a Pull Request (PR):
1. Run `npm run build` to verify zero TypeScript errors.
2. Ensure no hardcoded credentials exist.
3. Keep code compliant with Apple design standards and Light Mode guidelines on governance subdomains.

Thank you for helping build an AI-native, privacy-first web security ecosystem!
