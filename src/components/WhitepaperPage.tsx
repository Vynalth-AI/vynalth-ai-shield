import React, { useState } from 'react';

interface WhitepaperPageProps {
  onBack?: () => void;
  onDeployConsole?: () => void;
}

export const WhitepaperPage: React.FC<WhitepaperPageProps> = ({ onBack, onDeployConsole }) => {
  const [emailInput, setEmailInput] = useState('');
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setDownloaded(true);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070a13',
      color: '#cbd5e1',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      lineHeight: '1.8',
    }}>
      {/* Navigation Header */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2rem',
        borderBottom: '1px solid rgba(56, 189, 248, 0.08)',
        background: 'rgba(7, 10, 19, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '0.875rem',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#38bdf8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to portal
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', letterSpacing: '-0.02em' }}>Vynalth AI Shield LABS</span>
        </div>

        <button
          onClick={onDeployConsole}
          style={{
            padding: '0.5rem 1.25rem',
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Deploy Sandbox
        </button>
      </nav>

      {/* Main Content Area */}
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '4rem 1.5rem' }}>
        
        {/* Document Header */}
        <header style={{ marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '100px',
            padding: '0.25rem 0.75rem',
            fontSize: '0.75rem',
            color: '#38bdf8',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}>
            <span>📝</span> RESEARCH WHITEPAPER & BLOG
          </div>
          
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.25,
            color: '#f8fafc',
            marginBottom: '1rem',
            letterSpacing: '-0.03em',
          }}>
            Agentic AI 时代的网络身份验证与对抗机制
          </h1>
          
          <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
            随着自主 AI Agent（代理型 AI）逐步取代传统网络爬虫和自动化脚本，传统的验证码（CAPTCHA）和指纹防御机制已全面失效。本文探讨了基于人类微观行为动力学（Behavioral Kinetics）的主动防御架构。
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.85rem',
            color: '#64748b',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '1rem',
          }}>
            <span>By <strong>Vynalth AI Shield Security Lab</strong></span>
            <span>•</span>
            <span>July 2026</span>
            <span>•</span>
            <span>12 min read</span>
          </div>
        </header>

        {/* Dynamic Abstract Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.04) 0%, rgba(129, 140, 248, 0.04) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.15)',
          borderRadius: '1rem',
          padding: '1.75rem',
          marginBottom: '3rem',
        }}>
          <h3 style={{ margin: '0 0 0.75rem', color: '#38bdf8', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Abstract / 摘要</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.7 }}>
            大语言模型（LLM）的推理能力结合浏览器自动化，孕育了具有自主决策能力的 **Agentic AI**。它们能够自主分析网页、模拟登录、执行表单填充，甚至代人类完成在线支付。传统的图形验证码、拼图挑战对多模态大模型而言已是“毫秒级”可解的常识题。如何建立一套面向未来的、隐匿式的、不可伪造的身份信任层，是数字世界面临的最严峻挑战。
          </p>
        </div>

        {/* Article Body */}
        <article style={{ fontSize: '1.025rem', color: '#cbd5e1' }}>
          
          <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', borderLeft: '3px solid #38bdf8', paddingLeft: '0.75rem' }}>
            一、 传统防御的崩塌：多模态大模型的降维打击
          </h2>
          <p>
            自 2003 年 CAPTCHA（Completely Automated Public Turing test to tell Computers and Humans Apart）被提出以来，拼图、文字识别、红绿灯标定一直是最主流的人机验证屏障。然而，在以 GPT-4o、Claude 3.5 Sonnet 和 Gemini 等模型为代表的多模态 AI 爆发后，识别扭曲字符与高维图像的能力已经远超人类。
          </p>
          <p>
            由于大模型本身能够通过视觉输入判断拼图缺口、读懂路标，这导致以视觉交互为基础的人机校验对恶意流量几乎完全敞开。黑客只需调用标准 OCR 接口或大模型 API 即可在几毫秒内突破防线。这也带来了巨大的用户体验灾难：**合法人类用户在不断地做更难的图形题，而 AI 却可以直接绕过。**
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', borderLeft: '3px solid #38bdf8', paddingLeft: '0.75rem' }}>
            二、 行为动力学：抗 AI 伪造的最后防线
          </h2>
          <p>
            虽然大模型可以伪造人类的输入文本，或通过脚本直接生成完美的坐标位移，但它们无法完美模拟人类复杂的生理特征与微观肌肉控制的不完美性。这就是 **微观行为动力学（Behavioral Kinetics）**。
          </p>
          <p>
            人在操控鼠标或手机屏幕时，包含了几百种无意识的物理与生物特性：
          </p>
          <ul>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>生理微颤（Micro-jitter）：</strong> 人类手部肌肉天然存在 6Hz - 12Hz 的生理震颤。当我们将鼠标移向某处时，光标轨迹中会夹杂高频微观扰动。
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>加速度渐变（Velocity Transition）：</strong> 鼠标在加速与接近目标时的“减速犹豫”（Fitts's Law 费茨法则）符合人类大脑决策周期，而脚本模拟往往呈现出非自然的线性匀速或瞬时跳转。
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>按键动力学（Keystroke Dynamics）：</strong> 当人类打字时，不同字符组合的“按键按下时长”（Dwell Time）与“键间空隙时长”（Flight Time）因肌肉记忆差异而有特定的正态分布，这是自动化注入无法轻易重现的。
            </li>
          </ul>

          {/* Interactive illustration chart */}
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            margin: '2rem 0',
            textAlign: 'center',
          }}>
            <h4 style={{ margin: '0 0 1rem', color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 600 }}>
              📊 鼠标轨迹曲率谱分析：人类 vs 自动化脚本
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 200, padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 0.5rem', color: '#ef4444', fontWeight: 700, fontSize: '0.8rem' }}>AI Agent / 自动化脚本</p>
                <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                  {[10, 10, 10, 10, 10, 80, 10, 10, 10, 10].map((h, i) => (
                    <div key={i} style={{ width: 12, height: `${h}%`, background: '#ef4444', opacity: 0.8, borderRadius: '2px 2px 0 0' }} />
                  ))}
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>近乎完美的直线与恒定角速度</p>
              </div>

              <div style={{ flex: 1, minWidth: 200, padding: '1rem', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.8rem' }}>人类生理操作</p>
                <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                  {[12, 18, 35, 48, 62, 58, 42, 28, 15, 8].map((h, i) => (
                    <div key={i} style={{ width: 12, height: `${h}%`, background: '#38bdf8', opacity: 0.8, borderRadius: '2px 2px 0 0' }} />
                  ))}
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>自然的双峰速度曲线与微观物理噪声</p>
              </div>
            </div>
          </div>

          <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', borderLeft: '3px solid #38bdf8', paddingLeft: '0.75rem' }}>
            三、 Vynalth AI Shield 的防御实践：Vynalth HumanProof™ 3-Tier 决策引擎
          </h2>
          <p>
            作为 **Vynalth AI** 旗下的核心安全系统，Vynalth AI Shield 基于微观行为学与活体验证技术，设计了完整的 **Vynalth HumanProof™ 三级自适应决策管线**：
          </p>
          <ol style={{ paddingLeft: '1.25rem' }}>
            <li style={{ marginBottom: '1rem' }}>
              <strong>低风险透明通行 (Score ≥ 80)：</strong> 针对具有符合正态分布的滑鼠物理震颤、按键犹豫停顿的合法人类会话，系统判定为 `Human Verified`，实现 100% 零干擾透明通行。
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong>中风险 Vynalth HumanProof™ Challenge (40 ≤ Score &lt; 80)：</strong> 当 AI 识别到边界不确定会话时，自动拉起多维验证挑战：包含微手勢拖拽与基于 Web Camera API 的 **人脸活体验证（Liveness Verification）**。通过自然眨眼（Eye Blink）与头部微轉（Head Tilt）判别活体真实性，并将其实时归一化转化为 **128 维加密特征向量（`users.face_embedding_encrypted`）**，绝对不出售或长期保存原始图片。
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong>高风险即时阻断 (Score &lt; 40)：</strong> 针对零滑鼠轨迹、WebDriver 框架检测激活、瞬时批量提交的脚本，边缘网关直接返回 `403 Forbidden` 并触发企业级防火墙规则。
            </li>
          </ol>

          <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', borderLeft: '3px solid #38bdf8', paddingLeft: '0.75rem' }}>
            四、 区域合规实践：迎合马来西亚金融级 RMiT 规范
          </h2>
          <p>
            不仅是技术领先，针对亚太及东南亚金融和互联网平台，Vynalth AI Shield 提供了完全本地化的合规支持。
          </p>
          <p>
            针对马来西亚国家银行（Bank Negara Malaysia）颁布的 **RMiT（Risk Management in Technology，技术风险管理）** 准则，金融机构必须在网络边界对高敏感交易（如转账、账户设置修改）提供非静态、防重放攻击的安全审计日志。
          </p>
          <p>
            Vynalth AI Shield 提供了专用的 RMiT 合规证据链生成器：
          </p>
          <ul>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>防篡改可信度审计：</strong> 在云端保存不可更改的风险判定签名（HMAC-SHA256），以便国家安全机构及审计方进行合规追溯。
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>本地数据驻留（Data Residency）：</strong> 支持直接在东南亚（如吉隆坡或新加坡 VPC）本地实例化运行，防止金融用户核心数据外流至美欧区域。
            </li>
          </ul>
        </article>

        {/* PDF Download Section */}
        <div style={{
          marginTop: '4rem',
          padding: '2.5rem 2rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '1.25rem',
          textAlign: 'center',
        }}>
          {!downloaded ? (
            <form onSubmit={handleDownload}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700 }}>
                下载完整 PDF 白皮书
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: 480, margin: '0 auto 1.5rem' }}>
                输入您的工作邮箱以获取由 Vynalth AI 团队撰写的 32 页详细研究报告《Agentic AI 时代的网络身份验证与对抗机制》。
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', maxWidth: 420, margin: '0 auto' }}>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Download PDF
                </button>
              </div>
            </form>
          ) : (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <div style={{
                width: 50, height: 50,
                background: 'rgba(56, 189, 248, 0.1)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#38bdf8',
                fontSize: '1.5rem',
              }}>✓</div>
              <h3 style={{ margin: '0 0 0.5rem', color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700 }}>
                已发送至您的邮箱！
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                报告已发送至 <strong>{emailInput}</strong>。请检查您的收件箱（或垃圾邮件夹）。
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: '6rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '2rem',
          textAlign: 'center',
          color: '#475569',
          fontSize: '0.8rem',
        }}>
          <p>© 2026 Vynalth AI Inc. All rights reserved. Vynalth AI Shield is a subsidiary product of Vynalth AI.</p>
          <p style={{ marginTop: '0.5rem' }}>Designed for security compliance & friction-free user authentication.</p>
        </footer>

      </div>
    </div>
  );
};
