import React, { useState, useCallback } from 'react';
import type { StockAnalysis, ChatMessage, AnalysisSection, ScoreDetail } from './types';
import { InvestmentGrade } from './types';
import { analyzeStock, startChat, sendMessage } from './services/geminiService';
import StockInputForm from './components/StockInputForm';
import AnalysisResult from './components/AnalysisResult';
import Chat from './components/Chat';
import type { Chat as GeminiChat } from '@google/genai';
import { LineChart, Briefcase, MessagesSquare } from 'lucide-react';


const validateAndCalculateAnalysis = (data: Partial<StockAnalysis>): StockAnalysis => {
  const safeData: StockAnalysis = {
    companyName: data.companyName || '알 수 없는 회사',
    profitability: { totalScore: 0, per: { value: '데이터 없음', score: 0 }, pbr: { value: '데이터 없음', score: 0 }, sustainability: { value: '데이터 없음', score: 0 }, duplicateListing: { value: '데이터 없음', score: 0 }, ...data.profitability },
    shareholderReturn: { totalScore: 0, dividendYield: { value: '데이터 없음', score: 0 }, quarterlyDividends: { value: '데이터 없음', score: 0 }, dividendIncreaseYears: { value: '데이터 없음', score: 0 }, buybackAndCancellation: { value: '데이터 없음', score: 0 }, annualCancellationRate: { value: '데이터 없음', score: 0 }, treasuryStockRatio: { value: '데이터 없음', score: 0 }, ...data.shareholderReturn },
    growthPotential: { totalScore: 0, futurePotential: { value: '데이터 없음', score: 0 }, corporateGovernance: { value: '데이터 없음', score: 0 }, globalBrand: { value: '데이터 없음', score: 0 }, ...data.growthPotential },
    totalScore: 0,
    grade: InvestmentGrade.D,
    analystCommentary: data.analystCommentary || '분석 코멘트를 생성할 수 없습니다.',
    sources: data.sources || [],
  };

  const calculateTotal = (section: Partial<AnalysisSection> | undefined): number => {
    if (!section) return 0;
    let total = 0;
    for (const key in section) {
      if (key !== 'totalScore') {
        const item = section[key as keyof typeof section] as ScoreDetail;
        if (item && typeof item.score === 'number') {
          total += item.score;
        }
      }
    }
    return total;
  };

  safeData.profitability.totalScore = calculateTotal(safeData.profitability);
  safeData.shareholderReturn.totalScore = calculateTotal(safeData.shareholderReturn);
  safeData.growthPotential.totalScore = calculateTotal(safeData.growthPotential);

  safeData.totalScore = safeData.profitability.totalScore + safeData.shareholderReturn.totalScore + safeData.growthPotential.totalScore;
  
  if (safeData.totalScore > 80) {
      safeData.grade = InvestmentGrade.A;
  } else if (safeData.totalScore >= 70) {
      safeData.grade = InvestmentGrade.B;
  } else if (safeData.totalScore >= 50) {
      safeData.grade = InvestmentGrade.C;
  } else {
      safeData.grade = InvestmentGrade.D;
  }
  
  return safeData;
};


const App: React.FC = () => {
  const [stockName, setStockName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<StockAnalysis | null>(null);
  const [chatSession, setChatSession] = useState<GeminiChat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const handleAnalyze = useCallback(async () => {
    if (!stockName.trim()) {
      setError('종목명을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setChatMessages([]);
    setChatSession(null);

    try {
      const rawResult = await analyzeStock(stockName);
      const result = validateAndCalculateAnalysis(rawResult);
      setAnalysisResult(result);

      const chat = await startChat();
      setChatSession(chat);
      const initialChatMessage: ChatMessage = {
        role: 'model',
        text: `${result.companyName}에 대한 분석이 완료되었습니다. 궁금한 점이 있다면 질문해주세요.`
      };
      setChatMessages([initialChatMessage]);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(`'${stockName}' 분석 중 오류 발생: ${errorMessage} 회사명을 확인하거나 잠시 후 다시 시도해주세요.`);
    } finally {
      setIsLoading(false);
    }
  }, [stockName]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!chatSession) {
      setError('채팅이 초기화되지 않았습니다.');
      return;
    }
    
    setIsChatLoading(true);
    const updatedMessages: ChatMessage[] = [...chatMessages, { role: 'user', text: message }];
    setChatMessages(updatedMessages);

    try {
      let fullResponse = "";
      const stream = await sendMessage(chatSession, message);

      const modelMessageIndex = updatedMessages.length;
      setChatMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setChatMessages(prev => {
            const newMessages = [...prev];
            newMessages[modelMessageIndex] = { role: 'model', text: fullResponse };
            return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      const errorResponseMessage: ChatMessage = {
        role: 'model',
        text: '죄송합니다, 오류가 발생했습니다. 다시 시도해 주세요.'
      };
      setChatMessages(prev => [...prev, errorResponseMessage]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatSession, chatMessages]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LineChart className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">가치주 분석기</h1>
          </div>
          <a
            href="https://github.com/google-gemini-v2/gemini-api-cookbook"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            Gemini 제공
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-100 rounded-full">
                  <Briefcase className="w-6 h-6 text-blue-700" />
               </div>
               <div>
                  <h2 className="text-xl font-semibold text-gray-800">기업 분석</h2>
                  <p className="text-gray-500 mt-1">종목명을 입력하여 장기 투자 관점의 종합 분석을 수행하세요.</p>
               </div>
            </div>
            <div className="mt-6">
              <StockInputForm
                stockName={stockName}
                setStockName={setStockName}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
              <p className="font-bold">오류</p>
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="mt-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-lg font-semibold text-gray-600">분석 중입니다... 잠시만 기다려주세요.</p>
              <p className="text-sm text-gray-500">최신 데이터를 가져와 고급 분석을 실행하고 있습니다.</p>
            </div>
          )}
          
          {analysisResult && (
            <div className="mt-8 space-y-8">
              <AnalysisResult analysis={analysisResult} />
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                   <div className="p-3 bg-green-100 rounded-full">
                      <MessagesSquare className="w-6 h-6 text-green-700" />
                   </div>
                   <div>
                      <h3 className="text-xl font-semibold text-gray-800">애널리스트 추가 질문</h3>
                      <p className="text-gray-500 mt-1">분석에 대해 추가 질문을 하세요.</p>
                   </div>
                </div>
                <Chat 
                  messages={chatMessages} 
                  onSendMessage={handleSendMessage} 
                  isLoading={isChatLoading} 
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} 가치주 분석기. 모든 권리 보유.</p>
      </footer>
    </div>
  );
};

export default App;