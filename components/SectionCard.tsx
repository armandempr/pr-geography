import Link from 'next/link';
import type { Section, SectionProgress } from '@/lib/types';
import ProgressRing from './ProgressRing';

interface Props {
  section: Section;
  progress: SectionProgress | undefined;
  unlocked: boolean;
  index: number;
}

export default function SectionCard({ section, progress, unlocked, index }: Props) {
  const passed = progress?.passed ?? false;
  const learned = progress?.learned ?? false;
  const score = progress?.quizScore ?? null;

  let statusLabel = 'Bloqueado';
  let statusColor = 'text-slate-500';
  if (!unlocked) {
    statusLabel = 'Bloqueado';
    statusColor = 'text-slate-500';
  } else if (passed) {
    statusLabel = `Completado · ${score}%`;
    statusColor = 'text-green-400';
  } else if (learned) {
    statusLabel = 'Listo para quiz';
    statusColor = 'text-amber-400';
  } else {
    statusLabel = 'Por aprender';
    statusColor = 'text-blue-400';
  }

  const ringColor = passed ? '#22c55e' : learned ? '#f59e0b' : '#334155';
  const ringValue = passed ? 100 : learned ? 50 : 0;

  const card = (
    <div
      className={`relative flex flex-col gap-3 rounded-2xl border p-4 transition-all
        ${unlocked
          ? 'border-slate-700 bg-slate-800/80 hover:border-slate-500 hover:bg-slate-800 active:scale-[0.98]'
          : 'border-slate-800 bg-slate-900/50 opacity-60 cursor-not-allowed'
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{section.emoji}</span>
          <div>
            <p className="text-xs text-slate-500 font-medium">Sección {index + 1}</p>
            <h3 className="text-white font-bold text-base leading-tight">{section.title}</h3>
          </div>
        </div>
        <ProgressRing value={ringValue} color={ringColor} size={44} strokeWidth={4} />
      </div>

      <p className="text-sm text-slate-400 leading-snug">{section.description}</p>

      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
        <span className="text-xs text-slate-600">{section.municipalityIds.length} pueblos</span>
      </div>

      {unlocked && !passed && (
        <div className="flex gap-2 mt-1">
          <Link
            href={`/learn/${section.id}`}
            className="flex-1 text-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 transition-colors"
          >
            {learned ? 'Repasar' : 'Aprender'}
          </Link>
          {learned && (
            <Link
              href={`/quiz/${section.id}`}
              className="flex-1 text-center rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold py-2.5 transition-colors"
            >
              Quiz
            </Link>
          )}
        </div>
      )}

      {passed && (
        <div className="flex gap-2 mt-1">
          <Link
            href={`/learn/${section.id}`}
            className="flex-1 text-center rounded-xl border border-slate-600 hover:border-slate-500 text-slate-300 text-sm font-semibold py-2.5 transition-colors"
          >
            Repasar
          </Link>
          <Link
            href={`/quiz/${section.id}`}
            className="flex-1 text-center rounded-xl border border-green-700 hover:border-green-500 text-green-400 text-sm font-semibold py-2.5 transition-colors"
          >
            Jugar de nuevo
          </Link>
        </div>
      )}
    </div>
  );

  return card;
}
