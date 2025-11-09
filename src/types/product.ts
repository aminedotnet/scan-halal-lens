import { ProductStatus, AnalysisResult } from '@/services/ai';

export interface ScanHistory {
  id: string;
  timestamp: number;
  image: string;
  result: AnalysisResult;
}

export type { ProductStatus, AnalysisResult };
