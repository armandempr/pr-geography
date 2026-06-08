import type { Municipality } from '@/lib/types';

interface Props {
  municipality: Municipality;
  step: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export default function LearnStep({ municipality, step, total, onPrev, onNext, onFinish }: Props) {
  const isLast = step === total - 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Step counter */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400 font-medium">{step + 1} de {total} pueblos</span>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-amber-400' : i < step ? 'w-2 bg-green-500' : 'w-2 bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      {/* Municipality info card */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">{municipality.name}</h2>
          <p className="text-sm text-slate-400 mt-1 leading-snug">{municipality.geoNote}</p>
        </div>

        <div>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Barrios Notables</p>
          <div className="flex flex-wrap gap-2">
            {municipality.notableBarrios.map(barrio => (
              <span
                key={barrio}
                className="rounded-full bg-slate-700 text-slate-200 text-sm px-3 py-1"
              >
                {barrio}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onPrev}
          disabled={step === 0}
          className="flex-1 rounded-xl border border-slate-700 text-slate-300 font-semibold py-3 text-sm disabled:opacity-30 hover:border-slate-500 transition-colors"
        >
          ← Anterior
        </button>
        {isLast ? (
          <button
            onClick={onFinish}
            className="flex-1 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold py-3 text-sm transition-colors"
          >
            Ir al Quiz →
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 text-sm transition-colors"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}
