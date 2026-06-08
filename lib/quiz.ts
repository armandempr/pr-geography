import type { Municipality, QuizQuestion } from './types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distractorNames(correct: string, pool: string[], count: number): string[] {
  return shuffle(pool.filter(n => n !== correct)).slice(0, count);
}

export function generateQuiz(
  sectionMunicipalities: Municipality[],
  allMunicipalities: Municipality[],
): QuizQuestion[] {
  const allNames = allMunicipalities.map(m => m.name);
  const questions: QuizQuestion[] = [];

  for (const muni of sectionMunicipalities) {
    // Type A: given name, click on map
    questions.push({
      type: 'click-map',
      municipalityId: muni.id,
      choices: [],
      correctAnswer: muni.fips,
    });

    // Type B: given highlighted area, name it (4-choice)
    const poolIds = sectionMunicipalities.map(m => m.id);
    const wrongIds = shuffle(poolIds.filter(id => id !== muni.id)).slice(0, 3);
    const wrongNames = wrongIds.map(id => allMunicipalities.find(m => m.id === id)!.name);
    questions.push({
      type: 'name-it',
      municipalityId: muni.id,
      choices: shuffle([muni.name, ...wrongNames]),
      correctAnswer: muni.name,
    });

    // Type C: given a barrio, which municipality? (4-choice)
    const barrio = muni.notableBarrios[Math.floor(Math.random() * Math.min(3, muni.notableBarrios.length))];
    const wrongNamesC = distractorNames(muni.name, allNames, 3);
    questions.push({
      type: 'barrio',
      municipalityId: muni.id,
      barrio,
      choices: shuffle([muni.name, ...wrongNamesC]),
      correctAnswer: muni.name,
    });
  }

  return shuffle(questions);
}
