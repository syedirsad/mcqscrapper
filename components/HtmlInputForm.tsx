
import React from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface HtmlInputFormProps {
  htmlContent: string;
  setHtmlContent: (html: string) => void;
  htmlSourceUrl: string;
  setHtmlSourceUrl: (url: string) => void;
  onParse: () => void;
  isLoading: boolean;
  autoSwitchMessage?: string | null;
}

export const HtmlInputForm: React.FC<HtmlInputFormProps> = ({ htmlContent, setHtmlContent, htmlSourceUrl, setHtmlSourceUrl, onParse, isLoading, autoSwitchMessage }) => {
  return (
    <div className="mb-8">
      {autoSwitchMessage && (
        <div className="mb-6 p-4 border border-amber-500/40 bg-amber-500/10 rounded-lg text-amber-300" role="alert">
          <p className="font-semibold text-amber-200">Heads Up: Automated Scraping Was Blocked</p>
          <p className="text-sm mt-1">{autoSwitchMessage}</p>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="html-source-url" className="block mb-2 text-sm font-medium text-slate-300">
            Original Page URL <span className="text-slate-500">(Optional, for better image detection)</span>
          </label>
          <input
            id="html-source-url"
            type="url"
            value={htmlSourceUrl}
            onChange={(e) => setHtmlSourceUrl(e.target.value)}
            placeholder="e.g., https://questions.examside.com/..."
            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-slate-300 placeholder-slate-500"
            disabled={isLoading}
            aria-describedby="html-source-url-desc"
          />
          <p id="html-source-url-desc" className="mt-1.5 text-xs text-slate-500">
            Providing the URL helps correctly extract images that have relative paths (e.g. /images/q1.png).
          </p>
        </div>
        <textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          placeholder="Paste the full HTML source code of the page here..."
          className="w-full p-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-slate-300 placeholder-slate-500 min-h-[200px] font-mono text-sm"
          disabled={isLoading}
          aria-label="HTML Source Code Input"
        />
        <button
          onClick={onParse}
          disabled={isLoading || !htmlContent}
          className="w-full sm:w-auto self-end flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="w-5 h-5" />
              Parsing...
            </>
          ) : (
            'Extract MCQs'
          )}
        </button>
      </div>
    </div>
  );
};
