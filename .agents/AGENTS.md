# VitaShield / VitaMind AI — Agent Rules

## Trust & Compliance Portal Design

When building or editing pages for trust/compliance subdomains (`trust.*`, `status.*`):

- **Always use light mode**: white/slate-50 background, dark text — never the parent product's dark consumer theme (`#020617`)
- **Editorial typography**: Inter for body, DM Mono for all metrics/data/status values
- **Cards**: `bg-white border border-slate-200 rounded-xl shadow-sm` — no glassmorphism
- **Status badges**: colored border pills on white bg (emerald, amber, red) — no neon glow
- **Max-width**: `max-w-4xl` — document-like width, not full-width hero layout
- **Accent colors**: `teal-600` (security positive), `violet-700` (VitaShield), `amber-700` (pending/warning)
- **Headings**: normal case, `font-black tracking-tight text-slate-900` — never ALL CAPS
- **No**: glassmorphism, neon colors, heavy animations, `bg-[#020617]` or any dark bg variant
- **Micro-interactions only**: status dot animate-pulse, subtle hover:shadow-md on cards

## API Attribution

- `vitashield.sleepsomno.com` APIs — VitaShield (model/train, logs, verify, intel)
- `sleepsomno.com` APIs — VitaMind AI (telemetry, hall-of-fame, verify-certificate)
- Never label `sleepsomno.com` backend as `ai.sleepsomno.com`

## CORS

When adding new subdomains that call sleepsomno.com APIs, always update allowedOrigins in both:
- `somnoai-digital-sleep-lab/backend/_server.ts`
- `somnoai-digital-sleep-lab-backend/backend/_server.ts`
