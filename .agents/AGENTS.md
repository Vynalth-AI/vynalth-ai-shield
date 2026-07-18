# Vynalth AI Shield / Vynalth AI � Agent Rules

## Trust & Compliance Portal Design

When building or editing pages for trust/compliance subdomains (`trust.*`, `status.*`):

- **Always use light mode**: white/slate-50 background, dark text � never the parent product's dark consumer theme (`#020617`)
- **Editorial typography**: Inter for body, DM Mono for all metrics/data/status values
- **Cards**: `bg-white border border-slate-200 rounded-xl shadow-sm` � no glassmorphism
- **Status badges**: colored border pills on white bg (emerald, amber, red) � no neon glow
- **Max-width**: `max-w-4xl` � document-like width, not full-width hero layout
- **Accent colors**: `teal-600` (security positive), `violet-700` (Vynalth AI Shield), `amber-700` (pending/warning)
- **Headings**: normal case, `font-black tracking-tight text-slate-900` � never ALL CAPS
- **No**: glassmorphism, neon colors, heavy animations, `bg-[#020617]` or any dark bg variant
- **Micro-interactions only**: status dot animate-pulse, subtle hover:shadow-md on cards

## API Attribution

- `shield.sleepsomno.com` APIs � Vynalth AI Shield (model/train, logs, verify, intel)
- `sleepsomno.com` APIs � Vynalth AI (telemetry, hall-of-fame, verify-certificate)
- Never label `sleepsomno.com` backend as `ai.sleepsomno.com`

## CORS

When adding new subdomains that call sleepsomno.com APIs, always update allowedOrigins in both:
- `somnoai-digital-sleep-lab/backend/_server.ts`
- `somnoai-digital-sleep-lab-backend/backend/_server.ts`

## Vynalth AI Shield ??????(2026 ?????)

### 1. Impossible Travel (??????) � Cloudflare Worker r008

Always implement geo-velocity checks using Haversine distance:

`	ypescript
const calculateVelocity = (prev: GeoPoint, current: GeoPoint) => {
  const timeDelta = (new Date(current.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000;
  const distance = haversineDistance(prev.lat, prev.lon, current.lat, current.lon);
  const velocityKmh = (distance / timeDelta) * 3600;
  return { velocityKmh, timeDelta, distance };
};
// Block if supersonic AND short time window
if (velocityKmh > 1000 && timeDelta < 300) {
  return new Response('Impossible Travel Detected', { status: 403 });
}
`

- Store last 5 login geopoints per user in **Cloudflare KV** (key: geo:<user_id>)
- Frontend must POST { lat, lon, timestamp } after each successful auth
- Threshold: 1000 km/h (commercial aircraft limit) + 300s window

### 2. ??????????

**Keystroke Dynamics:**
- Listen to keydown/keyup events; record dwell (key held duration) and flight (gap between keys) in milliseconds
- Buffer in localStorage; flush to Supabase Edge Function every 30 events or on form submit

**Mouse Kinematics:**
- Use equestAnimationFrame at ~60fps sampling; record (x, y, t) triplets
- Compute: curvature ratio, acceleration variance, directional entropy
- Flag if curvature ratio > 0.95 (too straight) or acceleration variance < 5 (too uniform)

**Trust Score Fusion (Supabase Edge Function):**
`	ypescript
const continuousTrustScore = Math.round(
  0.35 * keystrokeScore +
  0.30 * mouseScore +
  0.20 * deviceFingerprintScore +
  0.15 * touchScore
);
`

### 3. ?????????

- Accept Oura Ring / Apple Health webhooks at /api/health-context
- Store sleepScore per user session in Supabase health_context table

`	ypescript
const fatigueFactor = sleepScore < 60 ? 1.5 : 0.7;
if (continuousTrustScore < 75 * fatigueFactor) triggerStrongAuth();
`

- Never store raw sleep data longer than 24 hours (HIPAA/PDPA minimization)
- Fatigue mode: disable risky operations (bulk export, payment, settings change)

### 4. ???????????

Always support these query prefixes in telemetry search bars:
- geo:<country> � filter by geographic origin substring
- geo:conflict / geo:travel � filter impossible travel anomaly logs
- nomaly:<term> / lag:<term> � filter by specific behavioral flag
- isk:<score> � filter logs with riskScore >= value

Backend: Use **PostgreSQL jsonb + GIN index** or Supabase full-text search:
`sql
CREATE INDEX idx_flags_gin ON verification_logs USING GIN (flags);
SELECT * FROM verification_logs WHERE flags @> '["impossible_travel_anomaly"]';
`

### 5. ???????

- All sensitive telemetry fields must use **Supabase Vault** encryption at rest
- Row Level Security (RLS): users can only read their own telemetry
- Right to Erasure endpoint must cascade-delete:
`sql
DELETE FROM telemetry WHERE user_id = ;
DELETE FROM health_context WHERE user_id = ;
DELETE FROM device_fingerprints WHERE user_id = ;
`
- Every deletion must append an immutable audit log entry with hash of prior record

---

## Vynalth AI Shield ??????

### ???????(???????????)

> "Vynalth AI Shield ?????????????????? + ???????????,?? AI+HEALTH ?????"

### ???????
1. **??**: ???? / ???????????(BNM RMiT ????)
2. **??**: ?? Telemedicine ??(? PDPA + GDPR ???)
3. **??**: ?? AI Health SaaS ??(? HIPAA + CCPA)

### ????(Freemium ? Enterprise)
- **Free**: ??????,?? 10,000 ???,?? Hall of Fame
- **Pro** (RM 299/?): GEO ???? + ??????? + ????
- **Enterprise** (Custom): ??? WAF ?? + SLA 99.99% + ????
