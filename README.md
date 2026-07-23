# 🛡️ Vynalth AI Shield: AI-Native Human Verification & Anti-Bot Infrastructure

[English](#english-version) | [中文版](#中文版本)

---

## 中文版本

**Vynalth AI Shield** 是由 **Vynalth AI** 團隊研發的企業級、AI 原生人機驗證與反自動化爬蟲防禦系統。旨在為 B2B SaaS、Web3 應用以及 API 網關提供高效、零干擾、隱私友好的防禦方案，有效遏制憑證撞庫、接口惡意刷單、數據爬取以及高級 AI 代理 (AI Operators) 的濫用。

### 🌟 當前版本已實現功能 (Currently Implemented)

*   **Vynalth HumanProof™ 3-Tier AI 決策引擎**：
    *   **低風險 (Human Score ≥ 80)**：✅ 直接通過 (Human Verified) — 無感透明通行。
    *   **中風險 (40 ≤ Human Score < 80)**：⚠️ 啟動 Vynalth HumanProof™ Challenge（微手勢 / 活體驗證）。
    *   **高風險 (Human Score < 40)**：❌ Block 阻斷 / 企業規則攔截。
*   **Multi-Signal 融合評分 (+20/+20/+25/+35 = 100)**：
    *   🖱️ 滑鼠軌跡熵与動態曲率：最高 **+20**
    *   📱 觸控/手勢加速度方差：最高 **+20**
    *   💻 設備/WebGL 渲染器信譽：最高 **+25**
    *   🧩 互動/活體挑戰結果：**+35**
*   **Vynalth HumanProof™ 活體驗證 (Liveness Verification)**：
    *   Web Camera API 實時捕捉人臉框（Reticle Oval）。
    *   自然眨眼（Eye Blink）與頭部微轉（Head Tilt）防照片/視頻翻拍。
    *   **不保存原始照片**：生成 128 維加密數學特徵向量（`users.face_embedding_encrypted`）。
*   **完整 10 大 Policy 政策條款體系**：
    *   包含 Privacy Policy、Human Verification Policy ⭐、Challenge Verification Policy、AI Transparency Policy、Anti-Abuse Policy、Developer API Policy、Data Retention Policy (24h 自動銷毀)、Security Policy (AES-256 Vault)、Responsible AI Policy 與 Vulnerability Disclosure Policy。
*   **Apple 官方極簡美學設計 (Apple Design System)**：
    *   採用主背景 Pure White (`#FFFFFF`)、Soft Gray (`#F5F5F7`)、Near Black (`#1D1D1F`)、Deep Navy (`#0A2540`) 与 Soft Teal (`#00C7B1`) 配色。

### 🗺️ 地區與開放策略 (Regional Access Policy)

*   🇲🇾 **馬來西亞 (MY) 與 🇸🇬 新加坡 (SG)** 地區即刻開放全功能使用。
*   🌏 **全球其他地區** 安排在 **2026年8月 (Asia/Kuala_Lumpur MYT)** 自動解鎖開放。

---

### 🚀 2分鐘快速集成指南

#### 1. 前端 SDK 接入 (Script Tag)

```html
<!-- 1. 引入 Vynalth AI Shield SDK -->
<script src="https://shield.sleepsomno.com/widget.js" defer></script>

<!-- 2. 在表單內放置驗證容器 -->
<form id="login-form" action="/login" method="POST">
  <input type="email" name="email" required />
  <input type="password" name="password" required />
  
  <!-- Vynalth AI Shield Widget 容器 -->
  <div id="vynalth-shield-widget" 
       data-sitekey="vms_pub_live_79a2b8e3df9102ca"
       data-theme-primary="#00c7b1"></div>
  
  <button type="submit">Sign In</button>
</form>
```

#### 2. 後端驗證 API (POST /api/verify)

```json
{
  "secret": "vms_sec_live_9c0f73b18274d8a21f7c",
  "token": "vmt_live_token_base64_telemetry_here",
  "ip": "203.0.113.195"
}
```

---

## English Version

**Vynalth AI Shield** is an enterprise-grade, AI-native human verification and anti-bot defense infrastructure developed by **Vynalth AI**. Engineered for B2B SaaS, Web3 apps, and API gateways, Vynalth AI Shield blocks automated script attacks, scraping networks, credential stuffing, and advanced AI Operators with invisible client telemetry.

### 🌟 Currently Implemented Features

*   **Vynalth HumanProof™ 3-Tier AI Decision Engine**:
    *   **Low Risk (Score ≥ 80)**: ✅ Allow (Human Verified) — Invisible transparent pass-through.
    *   **Medium Risk (40 ≤ Score < 80)**: ⚠️ Vynalth HumanProof™ Challenge (interactive micro-gestures or liveness check).
    *   **High Risk (Score < 40)**: ❌ Block / Custom Enterprise Action.
*   **Multi-Signal Score Fusion (+20 / +20 / +25 / +35 = 100)**:
    *   🖱️ Mouse trajectory entropy & curvature: Up to **+20**
    *   📱 Touch/gesture kinematics variance: Up to **+20**
    *   💻 Device & WebGL renderer reputation: Up to **+25**
    *   🧩 Interactive / Liveness challenge result: **+35**
*   **Vynalth HumanProof™ Liveness Verification**:
    *   Web Camera API face reticle positioning.
    *   Eye Blink Detection & Head Movement check against deepfakes and spoofing.
    *   **Zero raw photo storage**: Encrypted 128-dimensional mathematical vector (`users.face_embedding_encrypted`).
*   **10 Core Legal Policies Suite**:
    *   Includes Privacy Policy, Human Verification Policy ⭐, Challenge Verification Policy, AI Transparency Policy, Anti-Abuse Policy, Developer & API Policy, Data Retention Policy (24h ephemeral wipe), Security Policy (AES-256 Supabase Vault), Responsible AI Policy, and Vulnerability Disclosure Policy.
*   **Apple Design System Aesthetic**:
    *   Built with Pure White (`#FFFFFF`), Soft Gray (`#F5F5F7`), Near Black (`#1D1D1F`), Deep Navy (`#0A2540`), and Soft Teal (`#00C7B1`).

### 🗺️ Regional Access Policy

*   🇲🇾 **Malaysia (MY) & 🇸🇬 Singapore (SG)**: Immediate full access enabled.
*   🌏 **Global / Rest of World**: Time-gated to auto-open worldwide starting **August 2026 (Asia/Kuala_Lumpur MYT)**.

---

### 🚀 Quick Start Integration

#### 1. Frontend SDK Embed

```html
<!-- Include Vynalth AI Shield SDK -->
<script src="https://shield.sleepsomno.com/widget.js" defer></script>

<!-- Place verification placeholder inside form -->
<form id="signup-form" action="/register" method="POST">
  <div id="vynalth-shield-widget" 
       data-sitekey="vms_pub_live_79a2b8e3df9102ca"
       data-theme-primary="#00c7b1"></div>
  <button type="submit">Submit</button>
</form>
```

#### 2. Backend Verification (POST /api/verify)

```json
{
  "secret": "vms_sec_live_your_private_secret_key",
  "token": "base64_telemetry_token_submitted_by_form",
  "ip": "203.0.113.195"
}
```
