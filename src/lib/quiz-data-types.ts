// Type definitions for the MAE101 quiz dataset.

export interface RubricItem {
  patterns: string[];
  points: number;
  description: string;
}

export interface Question {
  id: number;
  title: string;
  problem: string;
  hint: string;
  rubric: RubricItem[];
}
