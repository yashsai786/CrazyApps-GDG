export type AbsentMode = 'accessibility' | 'safety' | 'sustainability';

export interface AbsentFinding {
  title: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  evidence: string[];
  uncertainty: string;
  recommendation: string;
}

export interface AbsentAuditResult {
  scene: string;
  mode: AbsentMode;
  summary: string;
  findings: AbsentFinding[];
  overall_confidence: number;
  timestamp?: number;
}

export interface AnalyzeRequest {
  image: string; // base64 data url or raw base64
  mode: AbsentMode;
}
