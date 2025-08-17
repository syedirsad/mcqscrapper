import React from 'react';
import type { MCQ } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface DownloadButtonProps {
  mcqs: MCQ[];
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ mcqs }) => {
  const handleDownload = () => {
    if (mcqs.length === 0) return;

    const dataStr = JSON.stringify(mcqs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scraped-mcqs.json';
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={mcqs.length === 0}
      className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-slate-200 font-semibold rounded-md hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors duration-200"
      title={`Download ${mcqs.length} MCQs as JSON`}
    >
      <DownloadIcon className="w-5 h-5" />
      Download JSON
    </button>
  );
};
