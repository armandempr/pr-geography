export interface Municipality {
  id: string;
  fips: string;
  name: string;
  sectionId: number;
  notableBarrios: string[];
  geoNote: string;
}

export interface Section {
  id: number;
  title: string;
  emoji: string;
  description: string;
  municipalityIds: string[];
}

export interface SectionProgress {
  learned: boolean;
  quizScore: number | null;
  passed: boolean;
  attemptsCount: number;
}

export type QuestionType = 'click-map' | 'name-it' | 'barrio';

export interface QuizQuestion {
  type: QuestionType;
  municipalityId: string;
  barrio?: string;
  choices: string[];
  correctAnswer: string;
}
