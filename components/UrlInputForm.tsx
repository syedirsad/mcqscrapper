import React from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface UrlInputFormProps {
  startUrl: string;
  setStartUrl: (url: string) => void;
  onScrape: () => void;
  isLoading: boolean;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ startUrl, setStartUrl, onScrape, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScrape();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={startUrl}
          onChange={(e) => setStartUrl(e.target.value)}
          placeholder="https://questions.examside.com/..."
          className="flex-grow p-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-slate-300 placeholder-slate-500"
          disabled={isLoading}
          required
          aria-label="Starting URL for scraping"
        />
        <button
          type="submit"
          disabled={isLoading || !startUrl}
          className="flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="w-5 h-5" />
              Scraping...
            </>
          ) : (
            'Start Scraping'
          )}
        </button>
      </div>
    </form>
  );
};
