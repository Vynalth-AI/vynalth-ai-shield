# 🛡️ VitaShield Integration & Troubleshooting Guide

This guide documents crucial integration warnings, common errors developers encounter when deploying VitaShield telemetry scripts, their resolutions, and how to proactively prevent them.

---

## ⚠️ 1. JavaScript Initialization Order Error (`ReferenceError`)

### Symptom
The browser console throws a blocking exception:
```text
Uncaught ReferenceError: Cannot access 'sections' before initialization
```
This error halts all subsequent JavaScript execution on the page, including the VitaShield SDK initialization.

### Cause
In standard frontend scripts (e.g. `script.js`), page-load triggers (such as `handleScroll()` or `highlightActiveLink()`) are executed immediately upon document ready. If the constants/variables they reference (e.g., `const sections = ...`) are defined *below* those function calls in the file layout, the JavaScript engine triggers a **Temporal Dead Zone (TDZ)** violation.

### Fix
Move the DOM element declarations to the very top of the script:
```javascript
// 1. Declare selectors and constants at the top
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

// 2. Register scroll / load event listeners
window.addEventListener('scroll', handleScroll);
window.addEventListener('load', handleScroll);

// 3. Define helper functions below
function handleScroll() {
  highlightActiveLink();
}
```

### Prevention
*   **Establish a strict code layout pattern**: Always put state declarations, constants, and DOM queries at the top of scripts. Register listeners in the middle, and place helper functions at the bottom.
*   **Linting**: Configure your local builder or editor with ESLint rules (such as `no-use-before-define`) to automatically catch TDZ variables before deploying.

---

## 🔒 2. Content Security Policy (CSP) blocking external scripts (unpkg / Lucide)

### Symptom
Icons fail to render, and the browser console prints CSP block alerts:
```text
Refused to load the script 'https://unpkg.com/lucide@latest' because it violates the following Content Security Policy directive...
```

### Cause
Security headers in `vercel.json` or HTTP server configurations limit script executions (`script-src`) to self or trusted domains. If third-party modules like Lucide or FontAwesome (delivered via `https://unpkg.com` or other CDNs) are not whitelisted, they are blocked.

### Fix
Update your server's Content Security Policy headers to whitelist the required CDNs. For Vercel deployments, append the trusted source to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://vitashield.sleepsomno.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://vitashield.sleepsomno.com;"
        }
      ]
    }
  ]
}
```

### Prevention
*   **CSP Auditing**: Maintain a central dependency inventory of all external resources (CDNs, verification widgets, tracking scripts) and update your WAF or server headers checklist during dependency updates.
*   **Local Bundling**: Instead of relying on unpkg/CDN scripts, bundle third-party assets locally (e.g. `npm install lucide-react` or download scripts locally) to eliminate external network dependencies entirely.

---

## ℹ️ 3. Silent SDK Ingestions & Developer Output Warnings

When integrating the VitaShield script (`widget.js`), developers may see the following console alerts. These are normal and do not require code fixes:

### A. `/api/sdk-integrity-hash` 404 Response
*   **What it is**: The SDK client periodically sends environment checks to verify that the loaded script is secure. For fully static frontend sites, this endpoint will return a harmless `404 Not Found` response.
*   **Mitigation**: The SDK handles this backoff silently. It does not block form submissions or page interactions.
*   **Prevention**: Document this in your internal wiki so QA teams do not flag it as an integration failure.

### B. Dynamic `<div></div>` Console Logs
*   **What it is**: The SDK logs diagnostic wrappers to test if client DevTools are active or if headless scripts are attempting to hijack the DOM elements.
*   **Mitigation**: This is standard anti-debugging scanning and is fully expected.
*   **Prevention**: Inform your security ops team that these console logs are benign indicators of active human-kinetics protection.
