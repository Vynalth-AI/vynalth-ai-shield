import React, { useState } from 'react';

interface ChecklistItem {
  name: string;
  current: string;
  target: string;
  difficulty: '简单' | '中等' | '复杂' | '非常复杂';
  timeline: string;
  impact: '极高' | '高' | '中' | '低';
  completed: boolean;
}

interface ChecklistCategory {
  title: string;
  items: ChecklistItem[];
}

export const ChecklistPage: React.FC = () => {
  const [categories, setCategories] = useState<ChecklistCategory[]>([
    {
      title: '1.1 移动端检测能力 (P1 - 最高优先级)',
      items: [
        { name: '移动端 SDK 开发', current: '8/10', target: '8/10', difficulty: '非常复杂', timeline: '已完成 (Q1-Q4)', impact: '极高', completed: true },
        { name: '触控事件分析', current: '8/10', target: '8/10', difficulty: '复杂', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: '传感器数据利用 (加速度计、陀螺仪)', current: '7/10', target: '7/10', difficulty: '复杂', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: '移动浏览器指纹识别', current: '8/10', target: '8/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: '移动端行为模型', current: '8/10', target: '8/10', difficulty: '复杂', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: 'iOS/Android 原生应用支持', current: '7/10', target: '7/10', difficulty: '非常复杂', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true }
      ]
    },
    {
      title: '1.2 高级指纹伪装防御 (P1)',
      items: [
        { name: '多维度指纹融合检测', current: '8/10', target: '8/10', difficulty: '复杂', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: 'Canvas 指纹混淆检测', current: '8/10', target: '8/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: 'WebGL 指纹混淆检测', current: '8/10', target: '8/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: '字体指纹伪装检测', current: '7/10', target: '7/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '低', completed: true },
        { name: '指纹一致性验证', current: '9/10', target: '9/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: '"伪装过度"检测', current: '8/10', target: '8/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true }
      ]
    },
    {
      title: '1.3 AI 代理检测能力 (P1)',
      items: [
        { name: 'AI 代理行为识别', current: '8/10', target: '8/10', difficulty: '复杂', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: 'ChatGPT/Claude 代理检测', current: '8/10', target: '8/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: 'Selenium/Playwright 框架检测', current: '9/10', target: '9/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: 'Puppeteer 框架检测', current: '9/10', target: '9/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: '代理链检测 (多层代理)', current: '7/10', target: '7/10', difficulty: '复杂', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: '代理工具组合检测', current: '8/10', target: '8/10', difficulty: '复杂', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true }
      ]
    },
    {
      title: '1.4 行为动力学检测优化 (P2)',
      items: [
        { name: '鼠标轨迹分析精度', current: '9/10', target: '9/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: '按键时序分析精度', current: '9/10', target: '9/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: '滚动行为分析', current: '8/10', target: '8/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: '多指触控分析 (移动端)', current: '7/10', target: '7/10', difficulty: '复杂', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: '设备倾斜/重力感应分析', current: '6/10', target: '6/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: '时间序列行为模式', current: '8/10', target: '8/10', difficulty: '复杂', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true }
      ]
    },
    {
      title: '2.1 客户端 SDK 安全 (P0 - 最高紧急)',
      items: [
        { name: '代码混淆和加密', current: '9/10', target: '9/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: '调试器检测和反调试', current: '9/10', target: '9/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: '代码完整性校验', current: '9/10', target: '9/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: '源码映射保护', current: '8/10', target: '8/10', difficulty: '简单', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: '动态代码注入防护', current: '8/10', target: '8/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: '内存安全', current: '8/10', target: '8/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true }
      ]
    },
    {
      title: '2.2 Token 安全 (P0 - 最高紧急)',
      items: [
        { name: 'Token 加密强度', current: '9/10', target: '9/10', difficulty: '简单', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: '重放攻击防护', current: '9/10', target: '9/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: '时间戳验证', current: '9/10', target: '9/10', difficulty: '简单', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: '会话绑定', current: '9/10', target: '9/10', difficulty: '中等', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: 'Token 过期机制', current: '9/10', target: '9/10', difficulty: '简单', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true },
        { name: 'Token 签名验证', current: '9/10', target: '9/10', difficulty: '简单', timeline: '已完成 (Q1-Q4)', impact: '中', completed: true }
      ]
    },
    {
      title: '5.1 企业级功能 (P2)',
      items: [
        { name: '自定义规则引擎 (LocalStorage 持久化)', current: '9/10', target: '9/10', difficulty: '复杂', timeline: '已完成 (Q1-Q4)', impact: '高', completed: true },
        { name: '高级报告与分析', current: '8/10', target: '9/10', difficulty: '中等', timeline: '4-6 周', impact: '高', completed: false },
        { name: '威胁情报集成', current: '2/10', target: '8/10', difficulty: '复杂', timeline: '6-8 周', impact: '中', completed: false }
      ]
    }
  ]);

  const toggleItem = (catIdx: number, itemIdx: number) => {
    const updated = [...categories];
    const item = updated[catIdx].items[itemIdx];
    item.completed = !item.completed;
    item.current = item.completed ? item.target : '3/10';
    setCategories(updated);
  };

  // Compute overall statistics
  let totalItems = 0;
  let completedItems = 0;
  categories.forEach(c => {
    c.items.forEach(i => {
      totalItems++;
      if (i.completed) completedItems++;
    });
  });

  const completionPct = Math.round((completedItems / totalItems) * 100);

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">Roadmap & Capability Checklist</h1>
          <p style={styles.subtitle}>Track execution status across security shields, biometric engines, and compliance metrics.</p>
        </div>
        <div style={styles.completionCard}>
          <div style={styles.completionRing}>
            <svg width="60" height="60" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--secondary)"
                strokeDasharray={`${completionPct}, 100`}
                strokeWidth="3.5"
                style={{ strokeLinecap: 'round', transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div style={styles.completionText}>{completionPct}%</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Q1-Q4 Progress</div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>{completedItems} / {totalItems} Resolved</div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {categories.map((cat, catIdx) => (
          <div key={cat.title} className="glass-panel" style={styles.panel}>
            <h3 style={styles.panelTitle}>{cat.title}</h3>
            
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.thLeft}>Optimization Task</th>
                    <th style={styles.th}>Rating</th>
                    <th style={styles.th}>Target</th>
                    <th style={styles.th}>Timeline</th>
                    <th style={styles.th}>Impact</th>
                    <th style={styles.thRight}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.items.map((item, itemIdx) => (
                    <tr key={item.name} style={styles.tr}>
                      <td style={styles.tdLeft}>
                        <strong>{item.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dark)', marginTop: '2px' }}>
                          Difficulty: {item.difficulty}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{ 
                          color: item.completed ? 'var(--secondary)' : 'var(--warning)',
                          fontWeight: 'bold',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {item.current}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.target}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: item.completed ? '#34d399' : 'var(--text-muted)'
                        }}>{item.timeline}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: item.impact === '极高' || item.impact === '高' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                          color: item.impact === '极高' || item.impact === '高' ? 'var(--danger)' : 'var(--text-muted)'
                        }}>{item.impact}</span>
                      </td>
                      <td style={styles.tdRight}>
                        <button
                          onClick={() => toggleItem(catIdx, itemIdx)}
                          style={{
                            padding: '4px 10px',
                            background: item.completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${item.completed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '6px',
                            color: item.completed ? '#34d399' : 'var(--text-muted)',
                            fontSize: '0.72rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {item.completed ? 'COMPLETED' : 'PENDING'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2.5rem',
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #060913 0%, #0b111e 100%)',
    color: '#f8fafc',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '1.5rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)'
  },
  completionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px'
  },
  completionRing: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  completionText: {
    position: 'absolute',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: 'var(--secondary)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem'
  },
  panel: {
    padding: '1.75rem',
    borderRadius: '16px'
  },
  panelTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#00f2fe',
    marginBottom: '1.25rem'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  thRow: {
    borderBottom: '1px solid rgba(255,255,255,0.08)'
  },
  thLeft: {
    padding: '10px 14px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  th: {
    padding: '10px 14px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'center'
  },
  thRight: {
    padding: '10px 14px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'right'
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.2s'
  },
  tdLeft: {
    padding: '14px 14px',
    fontSize: '0.88rem'
  },
  td: {
    padding: '14px 14px',
    fontSize: '0.85rem',
    textAlign: 'center'
  },
  tdRight: {
    padding: '14px 14px',
    fontSize: '0.85rem',
    textAlign: 'right'
  }
};
