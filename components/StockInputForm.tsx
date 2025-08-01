import React from 'react';
import { Search } from 'lucide-react';

interface StockInputFormProps {
  stockName: string;
  setStockName: (name: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const StockInputForm: React.FC<StockInputFormProps> = ({ stockName, setStockName, onAnalyze, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
      <input
        type="text"
        value={stockName}
        onChange={(e) => setStockName(e.target.value)}
        placeholder="예: 삼성전자, Apple, 또는 현대차"
        className="w-full px-4 py-3 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            분석 중...
          </>
        ) : (
           <>
            <Search className="w-5 h-5 mr-2" />
            분석
           </>
        )}
      </button>
    </form>
  );
};

export default StockInputForm;