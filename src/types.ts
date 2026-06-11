export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  createdAt: string;
}

export type Verdict = 'Real' | 'Fake' | 'Misleading' | 'Partially True';
export type SourceType = 'url' | 'text' | 'file' | 'image' | 'camera';

export interface VerificationReport {
  reportId: string;
  uid: string;
  sourceType: SourceType;
  sourceData: {
    title?: string;
    url?: string;
    textExcerpt?: string;
    fileName?: string;
    imageExcerpt?: string;
  };
  verdict: Verdict;
  confidence: number;
  trustScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  summary: string;
  reasons: string[];
  recommendations: string[];
  reportUrl?: string;
  createdAt: string;
  isFavorite?: boolean;
  fallbackWarning?: string;
}

export interface HistoryItem {
  historyId: string;
  uid: string;
  action: string;
  timestamp: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  chatId: string;
  uid: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface StatsOverview {
  totalAnalyses: number;
  fakeCount: number;
  realCount: number;
  misleadingCount: number;
  partiallyTrueCount: number;
  averageConfidence: number;
  aiUsageCount: number;
}

export interface DailyUsage {
  date: string;
  analyses: number;
  fakeCount: number;
  realCount: number;
}

export interface SourceReliability {
  source: string;
  count: number;
  trustScore: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'maintenance';
  uptimeSeconds: number;
  apiLatencyMs: number;
  dbConnection: boolean;
  cpuUsage: number;
  memoryUsage: number;
}
