
import React from 'react';
import type { MCQ } from '../types';

interface McqCardProps {
  mcq: MCQ;
  index: number;
}

export const McqCard: React.FC<McqCardProps> = ({ mcq, index }) => {
  const getOptionLetter = (optionIndex: number) => String.fromCharCode(65 + optionIndex);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 shadow-md transition-shadow hover:shadow-lg hover:border-slate-600">
      {mcq.imageUrl && (
        <img
          src={mcq.imageUrl}
          alt={`Visual for question ${index + 1}`}
          className="mb-4 rounded-lg w-full max-h-80 object-contain bg-slate-700/50"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          loading="lazy"
        />
      )}
      <p className="font-semibold text-lg text-slate-200 mb-2" dangerouslySetInnerHTML={{ __html: `${index + 1}. ${mcq.question}`}} />
      {mcq.examName && (
        <p className="text-xs text-slate-400 italic mb-4">
          Source: {mcq.examName}
        </p>
      )}
      <div className="space-y-2">
        {mcq.options.map((option, i) => {
          const isCorrect = option === mcq.correctAnswer;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-md transition-colors ${
                isCorrect
                  ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                  : 'bg-slate-700/50 text-slate-300'
              }`}
            >
              <span className={`font-bold ${isCorrect ? 'text-green-400' : 'text-slate-400'}`}>{getOptionLetter(i)}.</span>
              <span dangerouslySetInnerHTML={{ __html: option }} />
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-slate-700">
        <p className="text-sm text-slate-400">
          Correct Answer: <span className="font-bold text-green-400" dangerouslySetInnerHTML={{ __html: mcq.correctAnswer }} />
        </p>
      </div>
    </div>
  );
};