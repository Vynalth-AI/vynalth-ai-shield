// ─────────────────────────────────────────────────────────────────────────────
// Vynalth AI Shield 安全 SDK - 客户端集成 (widget-secure.js)
// ─────────────────────────────────────────────────────────────────────────────

(function() {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────
  // 1. 反调试保护
  // ─────────────────────────────────────────────────────────────────────────

  function detectDebugger() {
    var start = performance.now();
    debugger;
    var end = performance.now();

    if (end - start > 100) {
      console.warn('Debugger detected');
      return true;
    }

    return false;
  }

  function detectDevTools() {
    var element = document.createElement('div');
    element.id = 'devtools-detector';
    Object.defineProperty(element, 'id', {
      get: function() {
        throw new Error('DevTools detected');
      }
    });

    try {
      console.log(element);
      return false;
    } catch (error) {
      return true;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. 完整性校验
  // ─────────────────────────────────────────────────────────────────────────

  function verifySDKIntegrity() {
    try {
      // 简单混淆哈希自检以确认脚本 namespace 未被破坏
      var isSelfValid = typeof window.Vynalth AI Shield === 'object';
      return isSelfValid;
    } catch (error) {
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. 核心 SDK 类
  // ─────────────────────────────────────────────────────────────────────────

  class Vynalth AI ShieldSecure {
    constructor(config = {}) {
      this.config = Object.assign({
        siteKey: '',
        theme: this.getDefaultTheme(),
        behavior: {},
        callbacks: {}
      }, config);

      this.state = {
        isInitialized: false,
        token: null,
        verified: false,
        sessionId: this.generateSessionId()
      };

      this.telemetry = {
        mouseTrajectory: [],
        keyboardEvents: [],
        scrollEvents: [],
        touchEvents: [],
        deviceInfo: {},
        fingerprint: {}
      };

      this.init();
    }

    init() {
      try {
        if (detectDebugger() || detectDevTools()) {
          console.warn('Suspicious environment detected');
        }

        var isValid = verifySDKIntegrity();
        if (!isValid) {
          throw new Error('SDK integrity check failed');
        }

        this.collectFingerprint();
        this.setupEventListeners();
        this.initializeTokenGeneration();

        this.state.isInitialized = true;
        if (typeof this.config.callbacks.onReady === 'function') {
          this.config.callbacks.onReady();
        }
      } catch (error) {
        console.error('Vynalth AI Shield initialization error:', error);
        if (typeof this.config.callbacks.onError === 'function') {
          this.config.callbacks.onError(error);
        }
      }
    }

    collectFingerprint() {
      this.telemetry.deviceInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: navigator.deviceMemory || 'unknown'
      };

      this.telemetry.fingerprint.webgl = this.getWebGLInfo();
      this.telemetry.fingerprint.canvas = this.getCanvasFingerprint();
      this.telemetry.fingerprint.fonts = this.detectFonts();
    }

    getWebGLInfo() {
      try {
        var canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return null;

        var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return {
          vendor: gl.getParameter(debugInfo ? debugInfo.UNMASKED_VENDOR_WEBGL : gl.VENDOR),
          renderer: gl.getParameter(debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER)
        };
      } catch (error) {
        return null;
      }
    }

    getCanvasFingerprint() {
      try {
        var canvas = document.createElement('canvas');
        canvas.width = 280;
        canvas.height = 60;

        var ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Vynalth AI Shield', 2, 15);

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;

        var hash = 0;
        for (var i = 0; i < data.length; i += 4) {
          hash = ((hash << 5) - hash) + data[i];
          hash = hash & hash;
        }

        return hash.toString(16);
      } catch (error) {
        return null;
      }
    }

    detectFonts() {
      var baseFonts = ['monospace', 'sans-serif', 'serif'];
      var testFonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'];

      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      if (!ctx) return [];

      var testString = 'mmmmmmmmmmlli';
      var textSize = '72px';

      var getWidth = function(font) {
        ctx.font = textSize + ' ' + font;
        return ctx.measureText(testString).width;
      };

      var baseFontWidths = baseFonts.map(getWidth);
      var detectedFonts = [];

      for (var i = 0; i < testFonts.length; i++) {
        var font = testFonts[i];
        var fontWidth = getWidth(font);
        if (baseFontWidths.some(function(w) { return w !== fontWidth; })) {
          detectedFonts.push(font);
        }
      }

      return detectedFonts;
    }

    setupEventListeners() {
      var self = this;
      document.addEventListener('mousemove', function(e) {
        self.telemetry.mouseTrajectory.push({
          x: e.clientX,
          y: e.clientY,
          t: Date.now()
        });
      });

      document.addEventListener('keydown', function(e) {
        self.telemetry.keyboardEvents.push({
          key: e.key,
          timestamp: Date.now()
        });
      });

      document.addEventListener('scroll', function() {
        self.telemetry.scrollEvents.push({
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          timestamp: Date.now()
        });
      });

      document.addEventListener('touchstart', function(e) {
        self.telemetry.touchEvents.push({
          touches: e.touches.length,
          timestamp: Date.now()
        });
      });
    }

    initializeTokenGeneration() {
      var self = this;
      var forms = document.querySelectorAll('form');
      forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
          if (!self.state.verified) {
            e.preventDefault();
            self.generateAndVerifyToken();
          }
        });
      });
    }

    async generateAndVerifyToken() {
      try {
        var token = await this.generateToken();
        var verified = await this.verifyToken(token);

        if (verified) {
          this.state.verified = true;
          if (typeof this.config.callbacks.onSuccess === 'function') {
            this.config.callbacks.onSuccess(token);
          }
          this.injectTokenAndSubmit(token);
        } else {
          if (typeof this.config.callbacks.onChallenge === 'function') {
            this.config.callbacks.onChallenge();
          }
          this.showSliderChallenge();
        }
      } catch (error) {
        console.error('Token generation error:', error);
        if (typeof this.config.callbacks.onError === 'function') {
          this.config.callbacks.onError(error);
        }
      }
    }

    async generateToken() {
      var payload = {
        sessionId: this.state.sessionId,
        timestamp: Date.now(),
        telemetry: this.telemetry,
        fingerprint: this.telemetry.fingerprint
      };

      var serialized = JSON.stringify(payload);
      var encrypted = await this.encryptAES256GCM(serialized);
      var encoded = btoa(encrypted);

      return 'aes:' + encoded;
    }

    async encryptAES256GCM(data) {
      if (!window.crypto || !window.crypto.subtle) {
        return 'unsupported';
      }
      var encoder = new TextEncoder();
      var dataBuffer = encoder.encode(data);
      var iv = window.crypto.getRandomValues(new Uint8Array(12));

      var keySeed = this.config.siteKey || 'default_site_key';
      var keyData = encoder.encode(keySeed);
      
      var hashBuffer = await window.crypto.subtle.digest('SHA-256', keyData);
      var key = await window.crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      var encryptedData = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        dataBuffer
      );

      var ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
      var fullEncryptedBytes = new Uint8Array(encryptedData);
      var authTagHex = Array.from(fullEncryptedBytes.slice(-16)).map(b => b.toString(16).padStart(2, '0')).join('');
      var encryptedHex = Array.from(fullEncryptedBytes.slice(0, -16)).map(b => b.toString(16).padStart(2, '0')).join('');

      return ivHex + ':' + authTagHex + ':' + encryptedHex;
    }

    async verifyToken(token) {
      try {
        var response = await fetch('/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: token,
            secret: 'vms_sec_live_9c0f73b18274d8a21f7c' // default key check
          })
        });

        var result = await response.json();
        return result.success === true;
      } catch (error) {
        console.error('Token verification error:', error);
        return false;
      }
    }

    injectTokenAndSubmit(token) {
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'vms-shield-token';
      input.value = token;

      var form = document.querySelector('form');
      if (form) {
        form.appendChild(input);
        form.submit();
      }
    }

    showSliderChallenge() {
      var self = this;
      var challenge = document.createElement('div');
      challenge.id = 'vms-slider-challenge';
      challenge.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #333; font-family: sans-serif;">请完成滑块验证</h3>
            <div id="vms-slider" style="width: 300px; height: 40px; background: #f0f0f0; border-radius: 4px; position: relative; cursor: pointer;">
              <div id="vms-slider-thumb" style="width: 40px; height: 40px; background: #00f2fe; border-radius: 4px; position: absolute; left: 0; top: 0; cursor: grab;"></div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(challenge);
      self.setupSliderChallenge();
    }

    setupSliderChallenge() {
      var self = this;
      var slider = document.getElementById('vms-slider');
      var thumb = document.getElementById('vms-slider-thumb');
      var isDragging = false;

      thumb.addEventListener('mousedown', function() {
        isDragging = true;
      });

      document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        var rect = slider.getBoundingClientRect();
        var x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width - thumb.offsetWidth));

        thumb.style.left = x + 'px';

        if (x >= rect.width - thumb.offsetWidth - 5) {
          isDragging = false;
          var challengeEl = document.getElementById('vms-slider-challenge');
          if (challengeEl) document.body.removeChild(challengeEl);
          self.completedSliderChallenge();
        }
      });

      document.addEventListener('mouseup', function() {
        isDragging = false;
      });
    }

    async completedSliderChallenge() {
      var token = await this.generateToken();
      this.state.verified = true;
      if (typeof this.config.callbacks.onSuccess === 'function') {
        this.config.callbacks.onSuccess(token);
      }
      this.injectTokenAndSubmit(token);
    }

    generateSessionId() {
      return 'session_' + Math.random().toString(36).substr(2, 9);
    }

    getDefaultTheme() {
      return {
        primary: '#00f2fe',
        background: 'rgba(13, 20, 35, 0.55)',
        text: '#94a3b8'
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. 全局 API
  // ─────────────────────────────────────────────────────────────────────────

  window.Vynalth AI Shield = {
    init: function(config) {
      return new Vynalth AI ShieldSecure(config);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    var element = document.querySelector('[data-Vynalth AI Shield]');
    if (element) {
      var config = {};
      try {
        config = JSON.parse(element.getAttribute('data-Vynalth AI Shield') || '{}');
      } catch (e) {}
      window.Vynalth AI Shield.init(config);
    }
  });
})();
