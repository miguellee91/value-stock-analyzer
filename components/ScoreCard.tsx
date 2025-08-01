
import React from 'react';
import type { StockAnalysis, ScoreDetail, AnalysisSection } from '../types';

interface ScoreCardProps {
  analysis: StockAnalysis;
}

const getScoreColor = (score: number, maxScore: number): string => {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (percentage >= 80) return 'bg-green-100 text-green-800';
  if (percentage >= 50) return 'bg-blue-100 text-blue-800';
  if (percentage > 0) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const ScoreRow: React.FC<{ label: string; scoreDetail: ScoreDetail; maxScore: number }> = ({ label, scoreDetail, maxScore }) => (
  <tr className="border-b border-gray-200">
    <td className="py-3 px-4 text-sm font-medium text-gray-600">{label}</td>
    <td className="py-3 px-4 text-sm text-gray-800 text-center">{scoreDetail.value}</td>
    <td className={`py-3 px-4 text-sm font-bold text-center rounded-md m-1 ${getScoreColor(scoreDetail.score, maxScore)}`}>
      {scoreDetail.score}
    </td>
  </tr>
);

const SectionHeader: React.FC<{ title: string; score: number; maxScore: number }> = ({ title, score, maxScore }) => (
  <thead className="bg-gray-100">
    <tr>
      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-2/4">{title}</th>
      <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700 w-1/4">값</th>
      <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700 w-1/4">
        점수 ({score})
      </th>
    </tr>
  </thead>
);

const ScoreCard: React.FC<ScoreCardProps> = ({ analysis }) => {
  const { profitability, shareholderReturn, growthPotential } = analysis;

  const sections = [
    { 
      title: '수익성 / 가치 / 지속가능성', 
      section: profitability, 
      maxScore: 35, 
      rows: [
        { label: 'PER', key: 'per', max: 20 },
        { label: 'PBR', key: 'pbr', max: 5 },
        { label: '이익 지속성', key: 'sustainability', max: 5 },
        { label: '중복 상장', key: 'duplicateListing', max: 5 },
      ] 
    },
    { 
      title: '주주 환원 정책', 
      section: shareholderReturn, 
      maxScore: 40, 
      rows: [
        { label: '배당 수익률', key: 'dividendYield', max: 10 },
        { label: '분기 배당', key: 'quarterlyDividends', max: 5 },
        { label: '배당 연속 인상', key: 'dividendIncreaseYears', max: 5 },
        { label: '자사주 매입 및 소각', key: 'buybackAndCancellation', max: 7 },
        { label: '연간 소각 비율', key: 'annualCancellationRate', max: 8 },
        { label: '자사주 보유 비율', key: 'treasuryStockRatio', max: 5 },
      ]
    },
    { 
      title: '미래 성장성 / 경쟁력', 
      section: growthPotential, 
      maxScore: 25, 
      rows: [
        { label: '미래 성장 잠재력', key: 'futurePotential', max: 10 },
        { label: '기업 경영', key: 'corporateGovernance', max: 10 },
        { label: '세계적 브랜드', key: 'globalBrand', max: 5 },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map(s => (
        <table key={s.title} className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
          <SectionHeader title={s.title} score={s.section?.totalScore ?? 0} maxScore={s.maxScore} />
          <tbody>
            {s.rows.map(row => {
               const scoreDetail = s.section?.[row.key] as ScoreDetail | undefined;
               return (
                <ScoreRow 
                  key={row.key}
                  label={row.label}
                  scoreDetail={scoreDetail ?? { value: '데이터 없음', score: 0 }}
                  maxScore={row.max}
                />
              );
            })}
          </tbody>
        </table>
      ))}
    </div>
  );
};

export default ScoreCard;