
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Instructions } from './components/Instructions';
import { UrlInputForm } from './components/UrlInputForm';
import { HtmlInputForm } from './components/HtmlInputForm';
import { McqDisplay } from './components/McqDisplay';
import { extractDataFromHtml, fetchHtmlWithFallbacks, ProxyBlockedError } from './services/geminiService';
import type { MCQ } from './types';

const LOCAL_STORAGE_KEY = 'scrapedMcqs';

export default function App(): React.ReactNode {
  const [mode, setMode] = useState<'url' | 'html'>('url');
  const [startUrl, setStartUrl] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [htmlSourceUrl, setHtmlSourceUrl] = useState<string>('');
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressLogs, setProgressLogs] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [autoSwitchMessage, setAutoSwitchMessage] = useState<string | null>(null);
  
  const scrapingProcessRef = useRef<{ isAborted: boolean } | null>(null);
  
  useEffect(() => {
    const savedMcqsRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedMcqsRaw) {
        try {
            const savedMcqs = JSON.parse(savedMcqsRaw);
            if (Array.isArray(savedMcqs) && savedMcqs.length > 0) {
                if (window.confirm(`Found ${savedMcqs.length} MCQs from a previous session. Do you want to restore them?`)) {
                    setMcqs(savedMcqs);
                    setHasStarted(true);
                    setProgressLogs([`Restored ${savedMcqs.length} MCQs from the previous session.`]);
                } else {
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                }
            }
        } catch (e) {
            console.error("Failed to parse saved MCQs from localStorage", e);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }
  }, []);

  useEffect(() => {
    if (mcqs.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mcqs));
    } else {
      // Clear storage if user clears results
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [mcqs]);

  const addLog = (message: string) => {
    setProgressLogs(prev => [...prev, message]);
  }

  const handleScrape = useCallback(async () => {
    let validatedUrl;
    try {
      validatedUrl = new URL(startUrl);
    } catch (_) {
      setError('Please enter a valid starting URL.');
      return;
    }

    if (scrapingProcessRef.current) {
      scrapingProcessRef.current.isAborted = true;
    }
    const currentScrape = { isAborted: false };
    scrapingProcessRef.current = currentScrape;

    setIsLoading(true);
    setError(null);
    setMcqs([]);
    setProgressLogs([]);
    setHasStarted(true);
    setAutoSwitchMessage(null);
    addLog('Starting new scraping process...');

    const allFoundMcqs: MCQ[] = [];
    const SCRAPE_DELAY_MS = 2000; // 2-second delay to prevent rate-limiting

    try {
      let currentUrl: string | null = validatedUrl.href;
      let pageCount = 1;

      while (currentUrl && !currentScrape.isAborted) {
        addLog(`Scraping page ${pageCount}: Fetching...`);
        const html = await fetchHtmlWithFallbacks(currentUrl);
        if (currentScrape.isAborted) break;
        
        addLog(`(Page ${pageCount}) Extracting data via AI...`);
        const { mcqs: newMcqs, nextUrl: foundNextUrl } = await extractDataFromHtml(html, currentUrl);
        if (currentScrape.isAborted) break;
        
        addLog(`(Page ${pageCount}) Found ${newMcqs.length} new MCQs.`);

        allFoundMcqs.push(...newMcqs);
        setMcqs([...allFoundMcqs]);
        
        const previousUrl = currentUrl;
        currentUrl = foundNextUrl;

        if (currentUrl === previousUrl) {
          console.warn("Next URL is the same as the current URL. Stopping to prevent an infinite loop.");
          currentUrl = null;
        }

        pageCount++;

        if (currentUrl && !currentScrape.isAborted) {
          addLog(`Waiting for ${SCRAPE_DELAY_MS / 1000}s to avoid API rate limits...`);
          await new Promise(resolve => setTimeout(resolve, SCRAPE_DELAY_MS));
        }
      }

      if (currentScrape.isAborted) {
        addLog('Scraping cancelled.');
      } else {
        addLog(`Scraping complete! Found ${allFoundMcqs.length} MCQs across ${pageCount - 1} pages.`);
      }

    } catch (e) {
      if (e instanceof ProxyBlockedError) {
        setMode('html');
        setAutoSwitchMessage(`Automated scraping from "${e.url}" was blocked. As a workaround, please open the URL in a new tab, view its page source (usually by right-clicking), copy the entire HTML, and paste it into the text area below.`);
        setHasStarted(false);
        setError(null);
        setProgressLogs([]);
      } else {
        console.error(e);
        let errorMessage = 'An unknown error occurred during scraping.';
        if (e instanceof Error) {
          errorMessage = e.message;
        }
        setError(errorMessage);
        addLog(`Error: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [startUrl]);
  
  const handleParseHtml = useCallback(async () => {
    if (!htmlContent) {
        setError('Please paste HTML content before parsing.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setMcqs([]);
    setProgressLogs([]);
    setHasStarted(true);
    addLog("Starting HTML parsing...");

    try {
        addLog('Extracting data via AI...');
        const { mcqs: newMcqs } = await extractDataFromHtml(htmlContent, htmlSourceUrl);
        
        setMcqs(newMcqs);
        addLog(`Parsing complete! Found ${newMcqs.length} MCQs.`);

    } catch (e) {
        console.error(e);
        let errorMessage = 'An unknown error occurred during parsing.';
        if (e instanceof Error) {
            errorMessage = e.message;
        }
        setError(errorMessage);
        addLog(`Error: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [htmlContent, htmlSourceUrl]);
  
  const resetState = () => {
    setError(null);
    setHasStarted(false);
    setMcqs([]);
    setProgressLogs([]);
  };
  
  const handleClearResults = () => {
    resetState();
    setStartUrl('');
    setHtmlContent('');
    setHtmlSourceUrl('');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleModeSwitch = (newMode: 'url' | 'html') => {
    setMode(newMode);
    resetState();
    setAutoSwitchMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Instructions />
          
          <div className="flex mb-4 border-b border-slate-700">
            <button
              onClick={() => handleModeSwitch('url')}
              className={`px-6 py-2 text-base font-semibold transition-colors duration-200 -mb-px border-b-2 ${
                mode === 'url'
                  ? 'border-blue-500 text-slate-100'
                  : 'border-transparent text-slate-400 hover:text-slate-100'
              }`}
              aria-current={mode === 'url'}
            >
              Scrape via URL
            </button>
            <button
              onClick={() => handleModeSwitch('html')}
              className={`px-6 py-2 text-base font-semibold transition-colors duration-200 -mb-px border-b-2 ${
                mode === 'html'
                  ? 'border-blue-500 text-slate-100'
                  : 'border-transparent text-slate-400 hover:text-slate-100'
              }`}
              aria-current={mode === 'html'}
            >
              Parse Pasted HTML
            </button>
          </div>

          {mode === 'url' ? (
            <UrlInputForm
              startUrl={startUrl}
              setStartUrl={setStartUrl}
              onScrape={handleScrape}
              isLoading={isLoading}
            />
          ) : (
            <HtmlInputForm
              htmlContent={htmlContent}
              setHtmlContent={setHtmlContent}
              htmlSourceUrl={htmlSourceUrl}
              setHtmlSourceUrl={setHtmlSourceUrl}
              onParse={handleParseHtml}
              isLoading={isLoading}
              autoSwitchMessage={autoSwitchMessage}
            />
          )}

          <McqDisplay
            isLoading={isLoading}
            error={error}
            mcqs={mcqs}
            hasStarted={hasStarted}
            progressLogs={progressLogs}
            onClear={handleClearResults}
          />
        </div>
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>Powered by React, Tailwind CSS, and Google Gemini</p>
      </footer>
    </div>
  );
}
