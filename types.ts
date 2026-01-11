export type QuestionType = 'multiple-choice' | 'fill-in-blank' | 'short-answer' | 'drag-drop';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // For MC (choices) or Drag-Drop (items to sort)
  correctIndex?: number; // For MC
  correctAnswer?: string; // For Fill-in and Short Answer
}

export interface User {
  id: string;
  name: string;
  password?: string;
  className: string;
  avatar: string;
  isAdmin: boolean;
  levelScores: Record<number, number>; // Level number -> Score
  badges: string[];
  totalScore: number;
}

export interface GameConfig {
  totalLevels: number;
  questionsPerLevel: number;
  passScore: number; // Score > passScore to pass
}

export enum GameView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  GAME = 'GAME',
  ADMIN = 'ADMIN',
  CERTIFICATE = 'CERTIFICATE',
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: (totalScore: number) => boolean;
}

// Default constants used for initialization
export const DEFAULT_CONFIG: GameConfig = {
  totalLevels: 6,
  questionsPerLevel: 10,
  passScore: 5 // > 5 means 6
};