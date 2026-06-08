'use client';

import { useEffect, useState } from 'react';
import { sections } from '@/data/sections';
import { getProgress, isSectionUnlocked, resetProgress } from '@/lib/progress';
import type { SectionProgress } from '@/lib/types';
import SectionCard from '@/components/SectionCard';

export default function Dashboard() {
  const [progress, setProgress] = useState<Record<number, SectionProgress>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProgress(getProgress());
    setMounted(true);
  }, []);

  const totalPassed = Object.values(progress).filter(p => p.passed).length;

  function handleReset() {
    if (confirm('¿Borrar todo el progreso? Esta acción no se puede deshacer.')) {
      resetProgress();
      setProgress({});
    }
  }

  return (
    <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 pb-10">
      {/* Header */}
      <div className="py-8 text-center">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="text-3xl">🇵🇷</span>
          <h1 className="text-3xl font-black text-white tracking-tight">PR Geo</h1>
        </div>
        <p className="text-slate-400 text-sm mt-1">Aprende los 78 pueblos de Puerto Rico</p>

        {mounted && totalPassed > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-900/40 border border-green-700/50 px-4 py-1.5">
            <span className="text-green-400 text-sm font-semibold">
              {totalPassed} de 10 secciones completadas
            </span>
          </div>
        )}
      </div>

      {/* Overall progress bar */}
      {mounted && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Progreso total</span>
            <span>{Math.round((totalPassed / 10) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${(totalPassed / 10) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Section cards */}
      <div className="flex flex-col gap-3">
        {sections.map((section, i) => (
          <SectionCard
            key={section.id}
            section={section}
            progress={mounted ? progress[section.id] : undefined}
            unlocked={mounted ? isSectionUnlocked(section.id) : section.id === 1}
            index={i}
          />
        ))}
      </div>

      {/* Footer */}
      {mounted && totalPassed > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={handleReset}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            Reiniciar progreso
          </button>
        </div>
      )}
    </main>
  );
}
