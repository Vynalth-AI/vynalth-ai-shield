# 🛡️ Vynalth AI Shield Integration & Troubleshooting Guide

This guide documents crucial integration warnings, common errors developers encounter when deploying Vynalth AI Shield telemetry scripts, their resolutions, and how to proactively prevent them.

---

## ⚠️ 1. JavaScript Initialization Order Error (`ReferenceError`)

### Symptom
The browser console throws a blocking exception:
```text
Uncaught ReferenceError: Cannot access 'sections' before initialization
```
This error halts all subsequent JavaScript execution on the page, including the Vynalth AI Shield SDK initialization.

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
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://shield.sleepsomno.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://shield.sleepsomno.com;"
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

When integrating the Vynalth AI Shield script (`widget.js`), developers may see the following console alerts. These are normal and do not require code fixes:

### A. `/api/sdk-integrity-hash` 404 Response
*   **What it is**: The SDK client periodically sends environment checks to verify that the loaded script is secure. For fully static frontend sites, this endpoint will return a harmless `404 Not Found` response.
*   **Mitigation**: The SDK handles this backoff silently. It does not block form submissions or page interactions.
*   **Prevention**: Document this in your internal wiki so QA teams do not flag it as an integration failure.

### B. Dynamic `<div></div>` Console Logs
*   **What it is**: The SDK logs diagnostic wrappers to test if client DevTools are active or if headless scripts are attempting to hijack the DOM elements.
*   **Mitigation**: This is standard anti-debugging scanning and is fully expected.
*   **Prevention**: Inform your security ops team that these console logs are benign indicators of active human-kinetics protection.

---

## 🌐 4. CORS Preflight Credentials Wildcard Block (`credentials: 'include' vs '*'`)

### Symptom
Browser blocks outgoing requests to Vynalth AI Shield endpoints (`/api/model/train` or `/api/verify`) with CORS error:
```text
Access to resource at 'https://shield.sleepsomno.com/api/model/train' from origin 'https://sleepsomno.com' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

### Cause
When client scripts perform fetch requests with `credentials: 'include'` (sending authentication headers, session cookies, etc.), modern browser security requirements mandate that the receiving server's `Access-Control-Allow-Origin` header **must match the exact requesting Origin domain**. If the server returns a wildcard `*`, the preflight pre-check is blocked by the browser.

### Fix
Our API endpoints have been upgraded to dynamically inspect incoming CORS request headers. Instead of returning `*`, they echo back the requesting `Origin` (e.g. `https://sleepsomno.com`) and attach `Access-Control-Allow-Credentials: true`.
Ensure your serverless config or router mirrors this pattern:
```javascript
const origin = req.headers.origin;
if (origin) {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
} else {
  res.setHeader('Access-Control-Allow-Origin', '*');
}
```

### Prevention
*   **Avoid Wildcards for Private/Authed Endpoints**: Never use `Access-Control-Allow-Origin: *` on endpoints that require authentication tokens, session states, or custom credentials.
*   **Explicit Origin Whitelisting**: Map client subdomains dynamically on the backend to restrict traffic to validated hostnames.

---

## ⚙️ 5. Service Worker MIME-type Stylesheet Block (`text/plain` stylesheet ReferenceError)

### Symptom
Styles fail to load, and console reports:
```text
Refused to apply style from 'https://sleepsomno.com/assets/index-BYlZwKHS.css' because its MIME type ('text/plain') is not a supported stylesheet MIME type, and strict MIME checking is enabled.
Uncaught (in promise) TypeError: Failed to fetch (sw.js:45)
```

### Cause
The Service Worker (`sw.js`) intercepts requests for `.css` static assets. If there is a network error or a cache-miss, the Service Worker fallback catches the request and mistakenly serves a default single-page app layout (like `index.html`) or a custom plain text 404 block with a `Content-Type: text/plain` or `text/html` header. The browser detects the MIME mismatch and blocks it.

### Fix
Adjust the fallback interception routing in your Service Worker (`sw.js`) to ignore stylesheets and scripts:
```javascript
// Inside sw.js Fetch Event Listener
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip routing fallback index.html for static CSS/JS/Image file requests
  const isStaticAsset = url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/);
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (!isStaticAsset) {
          return caches.match('/index.html'); // Only serve index.html for document routes
        }
        // Return a proper 404 response for assets
        return new Response('Asset not found', { 
          status: 404, 
          headers: { 'Content-Type': 'text/plain' } 
        });
      });
    })
  );
});
```

### Prevention
*   **MIME-type Safeguards**: Keep asset file requests isolated from single-page routing fallbacks.
*   **Cache Invalidation**: Configure Vite to append unique hashes to filenames (e.g. `index-[hash].css`) and update the service worker cache manifest on each build.

---

## 🛡️ 6. Cloudflare Turnstile Embed Location & AdBlocker Warnings

### Symptoms
1. **Turnstile Location Error**:
   ```text
   [Cloudflare Turnstile] Cannot determine Turnstile's embedded location, aborting clearance redemption, are you running Turnstile on a Cloudflare Zone?
   ```
2. **Google AdSense Block**:
   ```text
   Access to script at 'https://pagead2.googlesyndication.com/pagead/.../adsbygoogle.js' from origin 'https://sleepsomno.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
   ```

### Cause
*   **Turnstile**: Cloudflare Turnstile expects to run inside a valid browser document or a correctly configured iframe. If it is loaded inside a sandboxed iframe without `allow-same-origin` or on a domain not whitelisted in the Cloudflare Turnstile Dashboard, it aborts.
*   **Google AdSense**: Google AdSense scripts are blocked by local browser AdBlockers, causing a script preflight load check failure (`ERR_FAILED`). Alternatively, including the `crossorigin` attribute in the AdSense `<script>` tag forces a CORS verification, which Google's CDNs do not support.

### Fix
*   **For Turnstile**:
    - Ensure Turnstile widgets are loaded inside standard browser frames or iframes configured with: `sandbox="allow-same-origin allow-scripts allow-forms"`.
    - Register the target domains (`sleepsomno.com`) in the Turnstile settings dashboard.
*   **For Google AdSense**:
    - Remove `crossorigin` or `crossorigin="anonymous"` from your AdSense script tag:
      ```html
      <!-- CORRECT (No crossorigin attribute) -->
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxx"></script>
      ```
    - Check if local AdBlockers are active during testing.

### Prevention
*   **Audit Script Attributes**: Keep `crossorigin` attributes exclusive to CORS-enabled CDNs.
*   **Sandboxing Best Practices**: Ensure all third-party iframe overlays carry adequate permissions to prevent host resolution errors.

