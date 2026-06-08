'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sectionById } from '@/data/sections';
import { municipalities, municipalityById, municipalityByFips } from '@/data/municipalities';
import { saveQuizResult, isSectionUnlocked } from '@/lib/progress';
import { generateQuiz } from '@/lib/quiz';
import type { QuizQuestion } from '@/lib/types';
import PuertoRicoMap from '@/components/PuertoRicoMap';
import QuizChoice from '@/components/QuizChoice';

interface FlashState {
  fips: string;
  correct: boolean;
}

type Phase = 'quiz' | 'result';

export default function QuizPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: sectionParam } = use(params);
  const router = useRouter();
  const sectionId = parseInt(sectionParam, 10);
  const section = sectionById.get(sectionId);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [flashState, setFlashState] = useState<FlashState | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('quiz');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isSectionUnlocked(sectionId)) {
      router.replace('/');
      return;
    }
    if (!section) return;
    const sectionMunis = section.municipalityIds
      .map(id => municipalities.find(m => m.id === id))
      .filter(Boolean) as typeof municipalities;
    setQuestions(generateQuiz(sectionMunis, municipalities));
  }, [sectionId, section, router]);

  const currentQ = questions[currentIdx];
  const total = questions.length;

  const advance = useCallback((isCorrect: boolean) => {
    const next = currentIdx + 1;
    setTimeout(() => {
      setFlashState(null);
      setAnswered(null);
      if (next >= total) {
        const finalScore = Math.round(((correctCount + (isCorrect ? 1 : 0)) / total) * 100);
        saveQuizResult(sectionId, finalScore);
        setPhase('result');
      } else {
        setCurrentIdx(next);
      }
    }, 1200);
  }, [currentIdx, correctCount, total, sectionId]);

  function handleClickMap(fips: string) {
    if (!currentQ || answered !== null) return;
    if (currentQ.type !== 'click-map') return;

    const isCorrect = fips === currentQ.correctAnswer;
    const flashFips = isCorrect ? fips : currentQ.correctAnswer;
    setAnswered(fips);
    setFlashState({ fips: flashFips, correct: isCorrect });
    if (isCorrect) setCorrectCount(c => c + 1);
    advance(isCorrect);
  }

  function handleChoice(choice: string) {
    if (!currentQ || answered !== null) return;
    if (currentQ.type === 'click-map') return;

    const isCorrect = choice === currentQ.correctAnswer;
    setAnswered(choice);
    if (isCorrect) setCorrectCount(c => c + 1);

    if (currentQ.type === 'name-it') {
      const muni = municipalityById.get(currentQ.municipalityId);
      if (muni) setFlashState({ fips: muni.fips, correct: isCorrect });
    }

    advance(isCorrect);
  }

  if (!section) return <p className="text-white p-8">Sección no encontrada.</p>;
  if (!mounted || questions.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Cargando quiz...</div>
      </main>
    );
  }

  if (phase === 'result') {
    const finalScore = Math.round((correctCount / total) * 100);
    const passed = finalScore >= 70;
    return (
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 pb-10">
        <div className="flex items-center gap-3 py-4">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">← Inicio</Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-10">
          <div className={`text-8xl font-black ${passed ? 'text-green-400' : 'text-red-400'}`}>
            {finalScore}%
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white mb-1">
              {passed ? '¡Excelente!' : 'Sigue practicando'}
            </p>
            <p className="text-slate-400 text-sm">
              {correctCount} de {total} correctas · {section.emoji} {section.title}
            </p>
          </div>

          {passed && sectionId < 10 && (
            <div className="rounded-xl border border-green-700/50 bg-green-900/20 p-4 text-center">
              <p className="text-green-400 font-semibold text-sm">
                ¡Sección {sectionId + 1} desbloqueada!
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => {
                setCurrentIdx(0);
                setCorrectCount(0);
                setAnswered(null);
                setFlashState(null);
                setPhase('quiz');
                const sectionMunis = section.municipalityIds
                  .map(id => municipalities.find(m => m.id === id))
                  .filter(Boolean) as typeof municipalities;
                setQuestions(generateQuiz(sectionMunis, municipalities));
              }}
              className="text-center rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold py-4 transition-colors"
            >
              Intentar de nuevo
            </button>
            <Link
              href="/"
              className="text-center rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold py-4 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Active quiz
  const currentMuni = currentQ ? municipalityById.get(currentQ.municipalityId) : null;
  const highlightedFips = currentQ?.type === 'name-it' && currentMuni ? [currentMuni.fips] : [];
  const progressPct = (currentIdx / total) * 100;

  function getQuestionText(q: QuizQuestion): string {
    if (q.type === 'click-map') {
      const muni = municipalityById.get(q.municipalityId);
      return `¿Dónde está ${muni?.name ?? ''}? Toca el mapa.`;
    }
    if (q.type === 'name-it') return '¿Cómo se llama el pueblo resaltado?';
    if (q.type === 'barrio') return `¿En qué pueblo está el barrio "${q.barrio}"?`;
    return '';
  }

  return (
    <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 pb-10">
      {/* Nav */}
      <div className="flex items-center justify-between py-4">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">← Inicio</Link>
        <span className="text-slate-400 text-sm font-medium">
          {currentIdx + 1} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-slate-800 mb-4">
        <div
          className="h-1.5 rounded-full bg-amber-400 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Score display */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-green-400">{correctCount} correctas</span>
        <span className="text-slate-700 text-xs">·</span>
        <span className="text-xs text-slate-500">{section.emoji} {section.title}</span>
      </div>

      {/* Map */}
      <div className={`map-container rounded-2xl overflow-hidden border mb-4 transition-all ${
        currentQ?.type === 'click-map' ? 'border-amber-500/50 bg-slate-900' : 'border-slate-700 bg-slate-900'
      }`}>
        {currentQ?.type === 'click-map' && (
          <p className="text-center text-xs text-amber-400 font-semibold py-2 bg-amber-500/10">
            Toca el municipio en el mapa
          </p>
        )}
        <PuertoRicoMap
          highlightedFips={highlightedFips}
          flashState={flashState}
          onMunicipalityClick={currentQ?.type === 'click-map' ? handleClickMap : undefined}
          interactive={currentQ?.type === 'click-map' && !answered}
        />
      </div>

      {/* Question & choices */}
      {currentQ && (
        <div className="flex flex-col gap-4">
          {currentQ.type === 'click-map' ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <p className="text-xl font-bold text-white">{getQuestionText(currentQ)}</p>
              {answered && (
                <p className={`text-sm mt-2 font-semibold ${flashState?.correct ? 'text-green-400' : 'text-red-400'}`}>
                  {flashState?.correct
                    ? '¡Correcto!'
                    : `Incorrecto — Era ${municipalityByFips.get(currentQ.correctAnswer)?.name}`}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <QuizChoice
                question={getQuestionText(currentQ)}
                choices={currentQ.choices}
                correctAnswer={currentQ.correctAnswer}
                onAnswer={handleChoice}
                answered={answered}
              />
              {answered && (
                <p className={`text-sm mt-3 font-semibold ${answered === currentQ.correctAnswer ? 'text-green-400' : 'text-red-400'}`}>
                  {answered === currentQ.correctAnswer ? '¡Correcto!' : `Incorrecto — Era ${currentQ.correctAnswer}`}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
