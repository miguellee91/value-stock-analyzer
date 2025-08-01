import React from 'react';
import type { StockAnalysis } from '../types';
import { InvestmentGrade } from '../types';
import ScoreCard from './ScoreCard';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts';
import { ClipboardList, TrendingUp, MessageCircle, PieChart, Link } from 'lucide-react';

interface AnalysisResultProps {
  analysis: StockAnalysis;
}

const gradeConfig = {
  [InvestmentGrade.A]: {
    color: 'bg-green-500',
    textColor: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
    title: 'A: 장기투자 적합, 적극 매수',
  },
  [InvestmentGrade.B]: {
    color: 'bg-blue-500',
    textColor: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    title: 'B: 장기투자 적합, 매수 고려',
  },
  [InvestmentGrade.C]: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-500',
    title: 'C: 보유',
  },
  [InvestmentGrade.D]: {
    color: 'bg-red-500',
    textColor: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
    title: 'D: 장기투자 비추천',
  },
};

const PercentageGauge: React.FC<{
  name: string;
  value: number;
  maxValue: number;
  color: string;
}> = ({ name, value, maxValue, color }) => {
  const percentage = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  const data = [{ name, value: percentage }];

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={100}>
        <RadialBarChart
          innerRadius="70%"
          outerRadius="90%"
          data={data}
          startAngle={90}
          endAngle={-270}
          barSize={10}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: '#eee' }}
            dataKey="value"
            angleAxisId={0}
            fill={color}
            cornerRadius={5}
          />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="font-bold text-xl fill-gray-800">
            {`${percentage}%`}
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
      <p className="text-sm font-medium text-gray-600 mt-1">{name}</p>
    </div>
  );
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  const config = gradeConfig[analysis.grade] || gradeConfig[InvestmentGrade.D];

  const chartData = [
    { name: '성장성', value: analysis.growthPotential?.totalScore ?? 0, fill: '#8884d8' },
    { name: '주주환원', value: analysis.shareholderReturn?.totalScore ?? 0, fill: '#82ca9d' },
    { name: '수익성', value: analysis.profitability?.totalScore ?? 0, fill: '#ffc658' },
  ];
  
  const totalScore = analysis.totalScore ?? 0;
  const companyName = analysis.companyName ?? '알 수 없는 회사';
  const analystCommentary = analysis.analystCommentary ?? '분석 코멘트를 생성할 수 없습니다.';
  const sources = analysis.sources ?? [];


  return (
    <div className="space-y-8">
      <div className={`bg-white p-6 rounded-xl shadow-md border-t-4 ${config.borderColor}`}>
        <h2 className="text-3xl font-bold text-gray-900">{companyName}</h2>
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className={`px-4 py-2 ${config.bgColor} rounded-full`}>
            <p className={`font-bold text-lg ${config.textColor}`}>{config.title}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">종합 점수</p>
            <p className="text-4xl font-extrabold text-gray-800">{totalScore}<span className="text-2xl font-medium text-gray-500">/100</span></p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3 bg-white p-6 rounded-xl shadow-md border border-gray-200">
           <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="w-6 h-6 text-indigo-600"/>
            <h3 className="text-xl font-semibold text-gray-800">점수 상세</h3>
          </div>
          <ScoreCard analysis={analysis} />
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-indigo-600"/>
              <h3 className="text-xl font-semibold text-gray-800">항목별 달성률</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <PercentageGauge
                  name="수익성"
                  value={analysis.profitability?.totalScore ?? 0}
                  maxValue={35}
                  color="#ffc658"
              />
              <PercentageGauge
                  name="주주환원"
                  value={analysis.shareholderReturn?.totalScore ?? 0}
                  maxValue={40}
                  color="#82ca9d"
              />
              <PercentageGauge
                  name="성장성"
                  value={analysis.growthPotential?.totalScore ?? 0}
                  maxValue={25}
                  color="#8884d8"
              />
            </div>
          </div>
          
          <hr className="border-gray-200" />
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <PieChart className="w-6 h-6 text-indigo-600"/>
              <h3 className="text-xl font-semibold text-gray-800">종합 점수 구성</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    innerRadius="20%" 
                    outerRadius="90%" 
                    data={chartData} 
                    startAngle={180} 
                    endAngle={-180}
                    barSize={15}
                  >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={10} />
                  <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" align="right" />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="font-bold text-4xl fill-gray-800">
                    {totalScore}
                  </text>
                  <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="font-medium text-lg fill-gray-500">
                    총점
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6 text-indigo-600"/>
            <h3 className="text-xl font-semibold text-gray-800">애널리스트 코멘트</h3>
        </div>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analystCommentary}</p>
        
        {sources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Link className="w-5 h-5 text-indigo-600" />
              <h4 className="text-lg font-semibold text-gray-800">데이터 출처</h4>
            </div>
            <ul className="space-y-2 list-none">
              {sources.map((source, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-gray-500">{index + 1}.</span>
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 break-all"
                  >
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResult;