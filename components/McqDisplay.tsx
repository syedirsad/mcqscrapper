import React from 'react';
import { McqCard } from './McqCard';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { DownloadButton } from './DownloadButton';
import type { MCQ } from '../types';

interface McqDisplayProps {
  isLoading: boolean;
  error: string | null;
  mcqs: MCQ[];
  hasStarted: boolean;
  progressLogs: string[];
  onClear: () => void;
}

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);


export const McqDisplay: React.FC<McqDisplayProps> = ({ isLoading, error, mcqs, hasStarted, progressLogs, onClear }) => {
  const hasMcqs = mcqs.length > 0;
  const lastLog = progressLogs[progressLogs.length - 1];

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all results and start over? This cannot be undone.")) {
      onClear();
    }
  };

  const renderLoadingSpinner = () => (
    <div className="text-center py-10">
      <LoadingSpinner className="w-10 h-10 mx-auto animate-spin text-blue-400" />
      <p className="mt-4 text-slate-400">{lastLog || "Initializing..."}</p>
    </div>
  );
  
  if (!hasStarted) {
    return null; // Don't show anything until the first scrape is attempted
  }

  return (
    <div className="mt-4">
      {/* --- Action/Status Header --- */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between min-h-[50px] gap-4">
        <div className="flex-grow w-full">
           {!error && lastLog && (
            <p className={`text-sm sm:text-base font-semibold p-3 rounded-md w-full text-center sm:text-left ${isLoading ? 'text-slate-400' : 'text-green-400 bg-green-500/10'}`}>
              {lastLog}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {hasMcqs && <DownloadButton mcqs={mcqs} />}
          {hasMcqs && (
             <button
              onClick={handleClear}
              className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-800/80 text-red-200 font-semibold rounded-md hover:bg-red-700 transition-colors duration-200"
              title="Clear all results"
            >
              <TrashIcon className="w-5 h-5" />
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* --- Error Display --- */}
      {error && (
        <div className="text-center py-4 px-4 bg-red-900/20 border border-red-500/30 rounded-lg mb-6" role="alert">
          <h3 className="text-xl font-semibold text-red-400 mb-2">An Error Occurred</h3>
          <p className="text-red-300 whitespace-pre-wrap">{error}</p>
          {hasMcqs && <p className="text-amber-300 mt-2 text-sm">You can download the {mcqs.length} MCQs that were successfully scraped before the error occurred.</p>}
        </div>
      )}
      
      {/* --- Main Content: Spinner, Results, or No Results Message --- */}
      {isLoading && !hasMcqs && renderLoadingSpinner()}

      {hasMcqs && (
        <div className={`space-y-6 transition-opacity duration-300 ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
          {mcqs.map((mcq, index) => (
            <McqCard key={`${mcq.question}-${index}`} mcq={mcq} index={index} />
          ))}
        </div>
      )}

      {!isLoading && !hasMcqs && !error && (
        <div className="text-center py-10 px-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No MCQs Found</h3>
          <p className="text-slate-400">The process completed, but no MCQs were found. Please check your source and try again.</p>
        </div>
      )}
    </div>
  );
};