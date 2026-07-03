/**
 * VitaShield Passive Behavioral Collector v1.0
 * ─────────────────────────────────────────────────────────────────────────────
 * 嵌入到任何网站（如 sleepsomno.com）以静默采集真实用户行为信号，
 * 并自动发送到 VitaShield 训练端点以持续改进 AI 反欺诈模型。
 *
 * 集成方法（仅需一行代码）:
 *   <script src="https://YOUR-VITASHIELD-DOMAIN/collector.js"
 *           data-site="sleepsomno.com"
 *           defer></script>
 *
 * 特性：
 *   • 零 UX 影响 — 完全在后台运行
 *   • 仅收集匿名行为模式（不含个人信息）
 *   • 使用 sendBeacon API 保证页面退出时数据不丢失
 *   • 收集不足时自动放弃，不浪费带宽
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  // ── 配置 ────────────────────────────────────────────────────────────────────
  var scriptEl   = document.currentScript;
  var siteLabel  = (scriptEl && scriptEl.dataset.site) || window.location.hostname;

  // 训练端点：从脚本所在域名自动推导，也支持 data-endpoint 覆盖
  var trainEndpoint = (scriptEl && scriptEl.dataset.endpoint) ||
    (function () {
      if (!scriptEl || !scriptEl.src) return null;
      try {
        var u = new URL(scriptEl.src);
        return u.origin + '/api/model/train';
      } catch (_) { return null; }
    })() ||
    'https://vita-shield.vercel.app/api/model/train';

  var MIN_MS         = 8000;   // 至少采集 8 秒
  var MAX_POINTS     = 80;     // 最多存 80 个鼠标点
  var MAX_KEY_TIMINGS = 20;    // 最多存 20 次键盘间隔
  var MIN_POINTS     = 6;      // 少于这个点数则放弃发送

  // ── 状态 ────────────────────────────────────────────────────────────────────
  var state = {
    mousePoints:  [],
    keyTimings:   [],
    lastKeyTime:  0,
    scrollCount:  0,
    clickCount:   0,
    startTime:    Date.now(),
    sent:         false
  };

  // ── 事件监听（全部 passive，零性能影响） ──────────────────────────────────
  document.addEventListener('mousemove', function (e) {
    if (state.mousePoints.length < MAX_POINTS) {
      state.mousePoints.push({ x: e.clientX, y: e.clientY, t: Date.now() });
    }
  }, { passive: true, capture: false });

  document.addEventListener('keydown', function () {
    var now = Date.now();
    if (state.lastKeyTime > 0 && state.keyTimings.length < MAX_KEY_TIMINGS) {
      state.keyTimings.push(now - state.lastKeyTime);
    }
    state.lastKeyTime = now;
  }, { passive: true, capture: false });

  document.addEventListener('scroll', function () {
    state.scrollCount++;
  }, { passive: true, capture: false });

  document.addEventListener('click', function () {
    state.clickCount++;
  }, { passive: true, capture: false });

  // ── 发送训练数据 ─────────────────────────────────────────────────────────
  function send() {
    if (state.sent) return;

    var elapsed = Date.now() - state.startTime;
    // 过滤质量不足的样本（时间太短 / 鼠标点太少 → 可能是机器人）
    if (elapsed < MIN_MS)                         return;
    if (state.mousePoints.length < MIN_POINTS)    return;

    state.sent = true;

    var payload = JSON.stringify({
      mousePoints:  state.mousePoints,
      keyTimings:   state.keyTimings,
      formDuration: elapsed,
      label:        'human',  // 仅发送通过自然互动的流量
      epochs:       1,
      source:       siteLabel,
      page:         window.location.pathname
    });

    // sendBeacon 保证浏览器关闭时数据也能发出
    if (navigator.sendBeacon) {
      try {
        // sendBeacon 用 Blob 传 JSON，保证 Content-Type 正确
        var blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(trainEndpoint, blob);
        return;
      } catch (_) { /* 降级到 fetch */ }
    }

    // 降级方案：使用 fetch keepalive
    fetch(trainEndpoint, {
      method:    'POST',
      headers:   { 'Content-Type': 'application/json' },
      body:      payload,
      keepalive: true
    }).catch(function () { /* 静默失败，不影响用户 */ });
  }

  // ── 触发时机 ──────────────────────────────────────────────────────────────
  // 1. 页面关闭 / 跳转时
  window.addEventListener('beforeunload', send);

  // 2. 页面切换到后台时（手机锁屏、切换标签）
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') send();
  });

  // 3. 在线会话超过 60 秒后主动发送（长停留用户）
  setTimeout(function () {
    if (!state.sent && state.mousePoints.length >= MIN_POINTS) {
      send();
    }
  }, 60000);

})();
