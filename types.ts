
export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
  examName: string;
  imageUrl?: string;
}

export interface ExtractionResult {
  mcqs: MCQ[];
  nextUrl: string | null;
}