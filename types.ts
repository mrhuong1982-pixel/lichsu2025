export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

export interface GameConfig {
  lessonName: string;
  hiddenImage: string | null; // URL or Base64
  coverImage: string | null; // Image covering the puzzle pieces
  coverImageMode: 'split' | 'repeat' | 'custom'; // Added 'custom' for per-piece images
  pieceImages: Record<string, string>; // Map of piece index to base64 image
  bgMusic: string | null;
  gridCols: number;
  gridRows: number;
  bgColor: string;
  schoolName: string;
  teacherName: string;
}

export const DEFAULT_IMAGE = "https://picsum.photos/800/600";