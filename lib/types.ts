export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AnalysisType = 'url' | 'message';

export interface AnalysisResult {
  score: number;
  riskLevel: RiskLevel;
  indicators: string[];
  explanation: string;
  recommendation: string;
}

export interface AnalysisRecord {
  id: string;
  user_id: string;
  type: AnalysisType;
  input: string;
  score: number;
  risk_level: RiskLevel;
  indicators: string[];
  explanation: string;
  recommendation: string;
  created_at: string;
}
