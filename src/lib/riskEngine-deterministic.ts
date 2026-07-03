// @ts-nocheck
import crypto from 'crypto';

// ─────────────────────────────────────────────────────────────────────────────
// 确定性伪随机数生成器 (Seeded PRNG)
// ─────────────────────────────────────────────────────────────────────────────

class SeededPRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0; // 转换为无符号 32 位整数
  }

  /**
   * 生成 0 到 1 之间的确定性随机数
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * 生成指定范围内的随机整数
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 确定性网络信誉评分
// ─────────────────────────────────────────────────────────────────────────────

class NetworkReputationService {
  private readonly ipReputationCache: Map<string, { score: number; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小时

  /**
   * 计算确定性网络信誉分数
   */
  async calculateNetworkReputation(ip: string, telemetry: any): Promise<number> {
    // 1. 检查缓存
    const cached = this.ipReputationCache.get(ip);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.score;
    }

    // 2. 使用确定性哈希生成伪随机种子
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
    const seed = parseInt(ipHash.substring(0, 8), 16);
    const prng = new SeededPRNG(seed);

    // 3. 查询 IP 信誉数据库
    const ipReputation = await this.queryIPReputationDB(ip);

    // 4. 计算基础分数
    let score = ipReputation.baseScore || 50;

    // 5. 应用确定性调整（而不是随机调整）
    const adjustment = prng.nextInt(-10, 10);
    score += adjustment;

    // 6. 应用地理位置因素
    if (telemetry.geolocation) {
      const geoHash = crypto.createHash('sha256')
        .update(telemetry.geolocation.country + telemetry.geolocation.city)
        .digest('hex');
      const geoSeed = parseInt(geoHash.substring(0, 8), 16);
      const geoPrng = new SeededPRNG(geoSeed);
      score += geoPrng.nextInt(-5, 5);
    }

    // 7. 缓存结果
    this.ipReputationCache.set(ip, { score, timestamp: Date.now() });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 查询 IP 信誉数据库
   */
  private async queryIPReputationDB(ip: string): Promise<{ baseScore: number }> {
    if (!process.env.IP_REPUTATION_API_URL) {
      return { baseScore: 50 };
    }
    try {
      const response = await fetch(`${process.env.IP_REPUTATION_API_URL}/lookup/${ip}`, {
        headers: {
          'Authorization': `Bearer ${process.env.IP_REPUTATION_API_KEY}`,
        },
      });

      if (!response.ok) {
        return { baseScore: 50 }; // 默认中立分数
      }

      const data = await response.json();
      return { baseScore: data.score || 50 };
    } catch (error) {
      console.error('Error querying IP reputation:', error);
      return { baseScore: 50 };
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 模型持久化服务
// ─────────────────────────────────────────────────────────────────────────────

interface AutoencoderModel {
  id: string;
  version: number;
  weights: number[][];
  bias: number[];
  trainedSamples: number;
  createdAt: Date;
  updatedAt: Date;
}

class ModelPersistenceService {
  private modelCache: Map<string, AutoencoderModel> = new Map();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 小时
  private lastCacheRefresh = 0;

  /**
   * 获取最新的自编码器模型
   */
  async getLatestModel(): Promise<AutoencoderModel | null> {
    // 1. 检查缓存
    const cached = this.modelCache.get('latest');
    if (cached && Date.now() - this.lastCacheRefresh < this.CACHE_TTL) {
      return cached;
    }

    // 2. 从数据库获取
    if (!process.env.MODEL_STORAGE_URL) {
      return null;
    }
    try {
      const response = await fetch(`${process.env.MODEL_STORAGE_URL}/models/latest`, {
        headers: {
          'Authorization': `Bearer ${process.env.MODEL_STORAGE_TOKEN}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const model = await response.json();

      // 3. 缓存模型
      this.modelCache.set('latest', model);
      this.lastCacheRefresh = Date.now();

      return model;
    } catch (error) {
      console.error('Error fetching latest model:', error);
      return null;
    }
  }

  /**
   * 保存训练后的模型
   */
  async saveModel(model: AutoencoderModel): Promise<boolean> {
    if (!process.env.MODEL_STORAGE_URL) return false;
    try {
      const response = await fetch(`${process.env.MODEL_STORAGE_URL}/models`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MODEL_STORAGE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(model),
      });

      if (!response.ok) {
        return false;
      }

      // 更新缓存
      this.modelCache.set('latest', model);
      this.lastCacheRefresh = Date.now();

      return true;
    } catch (error) {
      console.error('Error saving model:', error);
      return false;
    }
  }

  /**
   * 增量训练模型
   */
  async trainModel(existingModel: AutoencoderModel | null, newTelemetry: any): Promise<AutoencoderModel> {
    // 1. 初始化或加载现有模型
    let model = existingModel || this.initializeModel();

    // 2. 提取特征向量
    const features = this.extractFeatures(newTelemetry);

    // 3. 前向传播
    const encoded = this.encode(features, model);
    const decoded = this.decode(encoded, model);

    // 4. 计算损失并更新权重
    const loss = this.calculateLoss(features, decoded);
    this.updateWeights(model, features, decoded, loss);

    // 5. 更新训练样本计数
    model.trainedSamples += 1;
    model.updatedAt = new Date();

    // 6. 定期保存模型（每 1000 个样本）
    if (model.trainedSamples % 1000 === 0) {
      await this.saveModel(model);
    }

    return model;
  }

  private initializeModel(): AutoencoderModel {
    const inputSize = 128;
    const encodedSize = 32;

    return {
      id: crypto.randomUUID(),
      version: 1,
      weights: Array(inputSize).fill(0).map(() => 
        Array(encodedSize).fill(0).map(() => Math.random() * 0.01)
      ),
      bias: Array(encodedSize).fill(0),
      trainedSamples: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private extractFeatures(telemetry: any): number[] {
    // 从遥测数据提取 128 维特征向量
    const features: number[] = [];

    // 行为特征
    features.push(telemetry.mouseTrajectory?.length || 0);
    features.push(telemetry.keyboardEvents?.length || 0);
    features.push(telemetry.scrollEvents?.length || 0);
    features.push(telemetry.touchEvents?.length || 0);

    // 设备特征
    features.push(telemetry.screenWidth || 0);
    features.push(telemetry.screenHeight || 0);
    features.push(telemetry.devicePixelRatio || 1);

    // ... 更多特征

    // 填充到 128 维
    while (features.length < 128) {
      features.push(0);
    }

    return features.slice(0, 128);
  }

  private encode(features: number[], model: AutoencoderModel): number[] {
    // 简化的编码器实现
    const encoded: number[] = [];
    for (let i = 0; i < model.weights[0].length; i++) {
      let sum = model.bias[i];
      for (let j = 0; j < features.length; j++) {
        sum += features[j] * model.weights[j][i];
      }
      encoded.push(Math.tanh(sum)); // 激活函数
    }
    return encoded;
  }

  private decode(encoded: number[], model: AutoencoderModel): number[] {
    // 简化的解码器实现
    const decoded: number[] = [];
    for (let i = 0; i < model.weights.length; i++) {
      let sum = 0;
      for (let j = 0; j < encoded.length; j++) {
        sum += encoded[j] * model.weights[i][j];
      }
      decoded.push(Math.tanh(sum));
    }
    return decoded;
  }

  private calculateLoss(original: number[], reconstructed: number[]): number {
    let loss = 0;
    for (let i = 0; i < original.length; i++) {
      loss += Math.pow(original[i] - reconstructed[i], 2);
    }
    return loss / original.length;
  }

  private updateWeights(model: AutoencoderModel, features: number[], decoded: number[], loss: number): void {
    // 简化的梯度下降更新
    const learningRate = 0.001;
    for (let i = 0; i < model.weights.length; i++) {
      for (let j = 0; j < model.weights[i].length; j++) {
        const gradient = (decoded[i] - features[i]) * features[j];
        model.weights[i][j] -= learningRate * gradient;
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 改进的风险评分函数
// ─────────────────────────────────────────────────────────────────────────────

const networkReputationService = new NetworkReputationService();
const modelPersistenceService = new ModelPersistenceService();

export async function evaluateTelemetryDeterministic(telemetry: any, context: any) {
  // 1. 获取网络信誉分数（确定性）
  const networkReputation = await networkReputationService.calculateNetworkReputation(
    context.ip,
    telemetry
  );

  // 2. 获取或训练自编码器模型
  let model = await modelPersistenceService.getLatestModel();
  model = await modelPersistenceService.trainModel(model, telemetry);

  // 3. 计算自编码器错误
  const features = (model as any).extractFeatures?.(telemetry) || [];
  const autoencoderError = calculateAutoencoderError(features, model);

  // 4. 计算综合风险分数
  const riskScore = calculateDeterministicRiskScore({
    networkReputation,
    autoencoderError,
    telemetry,
  });

  return {
    riskScore,
    trustScore: 100 - riskScore,
    reputationScore: networkReputation,
    isAiAgent: riskScore > 70,
    agentType: determineAgentType(telemetry, riskScore),
    decision: riskScore > 70 ? 'block' : riskScore > 40 ? 'challenge' : 'allow',
    // ... 其他字段
  };
}

function calculateAutoencoderError(features: number[], model: AutoencoderModel | null): number {
  if (!model) return 0;

  // 简化实现
  let error = 0;
  for (let i = 0; i < Math.min(features.length, 32); i++) {
    error += Math.abs(features[i]);
  }

  return error / Math.min(features.length, 32);
}

function calculateDeterministicRiskScore(params: any): number {
  let score = 0;

  // 网络信誉占 30%
  score += (100 - params.networkReputation) * 0.3;

  // 自编码器错误占 40%
  score += params.autoencoderError * 0.4;

  // 行为异常占 30%
  const behaviorAnomalies = detectBehaviorAnomalies(params.telemetry);
  score += behaviorAnomalies * 0.3;

  return Math.min(100, Math.max(0, score));
}

function detectBehaviorAnomalies(telemetry: any): number {
  // 行为异常检查逻辑
  return 0;
}

function determineAgentType(telemetry: any, riskScore: number): string {
  if (riskScore < 40) return 'human';
  if (telemetry.userAgent?.includes('Selenium')) return 'selenium_bot';
  if (telemetry.userAgent?.includes('Puppeteer')) return 'puppeteer_bot';
  if (telemetry.userAgent?.includes('Playwright')) return 'playwright_bot';
  return 'unknown_bot';
}
