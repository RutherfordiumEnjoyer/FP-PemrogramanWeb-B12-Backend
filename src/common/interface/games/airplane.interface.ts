export interface IAirplaneQuestion {
  question: string;
  correctAnswer: string;
  wrongAnswers: string[]; // Jawaban salah (musuh/awan)
}

export interface IAirplaneGameData {
  questions: IAirplaneQuestion[];
  gameSettings?: {
    speed?: 'slow' | 'normal' | 'fast';
  };
}