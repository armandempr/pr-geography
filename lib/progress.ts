import type { SectionProgress } from './types';

const STORAGE_KEY = 'pr-geo-v1';

export function getProgress(): Record<number, SectionProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(progress: Record<number, SectionProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markLearned(sectionId: number): void {
  const p = getProgress();
  p[sectionId] = {
    learned: true,
    quizScore: p[sectionId]?.quizScore ?? null,
    passed: p[sectionId]?.passed ?? false,
    attemptsCount: p[sectionId]?.attemptsCount ?? 0,
  };
  save(p);
}

export function saveQuizResult(sectionId: number, score: number): void {
  const p = getProgress();
  const prev = p[sectionId];
  p[sectionId] = {
    learned: prev?.learned ?? true,
    quizScore: score,
    passed: score >= 70,
    attemptsCount: (prev?.attemptsCount ?? 0) + 1,
  };
  save(p);
}

export function isSectionUnlocked(sectionId: number): boolean {
  if (sectionId === 1) return true;
  return getProgress()[sectionId - 1]?.passed === true;
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
