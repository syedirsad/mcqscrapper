
import React from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';

export const Instructions: React.FC = () => {
  return (
    <div className="mb-8 p-5 border border-slate-700 rounded-lg bg-slate-800/50">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-3 text-blue-300">
        <ClipboardIcon className="w-6 h-6" />
        How to Use
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-slate-100 text-lg">Mode 1: Scrape via URL (Automated)</h3>
          <p className="text-slate-400 text-sm mt-1">The easiest method. The app will attempt to find content and automatically navigate through pages.</p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300 mt-3 pl-2">
            <li>Find the starting page of MCQs you want to scrape (e.g., from <a href="https://questions.examside.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">questions.examside.com</a>).</li>
            <li>Copy the full URL from your browser's address bar.</li>
            <li>Select the "Scrape via URL" tab and paste the URL into the input field.</li>
            <li>Click "Start Scraping" and wait for the process to complete.</li>
          </ol>
        </div>

        <div className="border-t border-slate-700/50"></div>

        <div>
          <h3 className="font-semibold text-slate-100 text-lg">Mode 2: Parse Pasted HTML (Manual Fallback)</h3>
          <p className="text-amber-400 text-sm mt-1">
            <strong className="font-semibold">Use this mode if URL scraping fails</strong> (e.g., due to a website blocking scrapers).
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300 mt-3 pl-2">
            <li>Navigate to the page with MCQs in your browser.</li>
            <li>Right-click anywhere on the page and select "View Page Source".</li>
            <li>Copy the <strong className="font-semibold">entire HTML source code</strong> (Ctrl+A, Ctrl+C).</li>
            <li>Select the "Parse Pasted HTML" tab and paste the HTML into the text area.</li>
            <li>Click "Extract MCQs." This will only parse the single page you've provided.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
