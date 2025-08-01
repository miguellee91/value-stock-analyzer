export interface ScoreDetail {
  value: string | number;
  score: number;
}

export interface AnalysisSection {
  totalScore: number;
  [key: string]: ScoreDetail | number;
}

export interface ProfitabilityAnalysis extends AnalysisSection {
  per: ScoreDetail;
  pbr: ScoreDetail;
  sustainability: ScoreDetail;
  duplicateListing: ScoreDetail;
}

export interface ShareholderReturnAnalysis extends AnalysisSection {
  dividendYield: ScoreDetail;
  quarterlyDividends: ScoreDetail;
  dividendIncreaseYears: ScoreDetail;
  buybackAndCancellation: ScoreDetail;
  annualCancellationRate: ScoreDetail;
  treasuryStockRatio: ScoreDetail;
}

export interface GrowthPotentialAnalysis extends AnalysisSection {
  futurePotential: ScoreDetail;
  corporateGovernance: ScoreDetail;
  globalBrand: ScoreDetail;
}

export enum InvestmentGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

export interface Source {
  uri: string;
  title: string;
}

export interface StockAnalysis {
  companyName: string;
  profitability: ProfitabilityAnalysis;
  shareholderReturn: ShareholderReturnAnalysis;
  growthPotential: GrowthPotentialAnalysis;
  totalScore: number;
  grade: InvestmentGrade;
  analystCommentary: string;
  sources: Source[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// netlifyIdentity를 전역 Window 객체에 추가하기 위한 타입 선언
declare global {
  interface Window {
    netlifyIdentity: any; // netlify-identity-widget의 타입 정의가 복잡하므로 일단 any로 설정
  }
}
