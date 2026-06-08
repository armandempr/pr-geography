'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sections, sectionById } from '@/data/sections';
import { municipalities, municipalityById } from '@/data/municipalities';
import { markLearned, isSectionUnlocked } from '@/lib/progress';
import PuertoRicoMap from '@/components/PuertoRicoMap';
import LearnStep from '@/components/LearnStep';

export default function LearnPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: sectionParam } = use(params);
  const router = useRouter();
  const sectionId = parseInt(sectionParam, 10);
  const section = sectionById.get(sectionId);

  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isSectionUnlocked(sectionId)) router.replace('/');
  }, [sectionId, router]);

  if (!section) return <p className="text-white p-8">Sección no encontrada.</p>;

  const sectionMunicipalities = section.municipalityIds
    .map(id => municipalityById.get(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof municipalityById.get>>[];

  const current = sectionMunicipalities[step];

  function handleFinish() {
    markLearned(sectionId);
    router.push(`/quiz/${sectionId}`);
  }

  // Highlight all section municipalities, current one brighter handled by map
  const allSectionFips = sectionMunicipalities.map(m => m.fips);
  const currentFips = current?.fips ?? '';

  return (
    <main className="flex-1 flex flex-col w-full pb-10">
      {/* Nav */}
      <div className="flex items-center gap-3 py-4 max-w-4xl mx-auto w-full px-4">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
          ← Inicio
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-300 text-sm font-semibold">
          {section.emoji} {section.title}
        </span>
      </div>

      {/* Map — full width up to 4xl */}
      <div className="max-w-4xl mx-auto w-full px-4 mb-4">
        <div className="map-container rounded-2xl overflow-hidden border border-slate-700 bg-slate-900">
          {mounted && (
            <PuertoRicoMap
              highlightedFips={[currentFips]}
              showLabels
            />
          )}
        </div>
      </div>

      {/* Learn step card */}
      <div className="max-w-2xl mx-auto w-full px-4">
        {current && (
          <LearnStep
            municipality={current}
            step={step}
            total={sectionMunicipalities.length}
            onPrev={() => setStep(s => Math.max(0, s - 1))}
            onNext={() => setStep(s => Math.min(sectionMunicipalities.length - 1, s + 1))}
            onFinish={handleFinish}
          />
        )}

        {/* All municipalities mini-list */}
        <div className="mt-6">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
            Pueblos de esta sección
          </p>
          <div className="flex flex-wrap gap-2">
            {sectionMunicipalities.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setStep(i)}
                className={`rounded-full text-xs font-semibold px-3 py-1.5 transition-colors ${
                  i === step
                    ? 'bg-amber-500 text-white'
                    : i < step
                    ? 'bg-green-900/50 text-green-400 border border-green-700/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
