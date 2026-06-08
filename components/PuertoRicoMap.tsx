'use client';

import { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { municipalityByFips } from '@/data/municipalities';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json';
const DEFAULT_CENTER: [number, number] = [-66.1, 18.22];
const DEFAULT_ZOOM = 1;

interface FlashState {
  fips: string;
  correct: boolean;
}

interface Props {
  highlightedFips?: string[];
  flashState?: FlashState | null;
  onMunicipalityClick?: (fips: string) => void;
  interactive?: boolean;
  showLabels?: boolean;
}

function getFill(geoId: string, highlightedFips: string[], flashState: FlashState | null | undefined): string {
  if (flashState?.fips === geoId) return flashState.correct ? '#22c55e' : '#ef4444';
  if (highlightedFips.includes(geoId)) return '#f59e0b';
  return '#334155';
}

function getHoverFill(geoId: string, highlightedFips: string[], interactive: boolean): string {
  if (!interactive) return getFill(geoId, highlightedFips, null);
  if (highlightedFips.includes(geoId)) return '#fbbf24';
  return '#475569';
}

export default function PuertoRicoMap({
  highlightedFips = [],
  flashState,
  onMunicipalityClick,
  interactive = false,
  showLabels = false,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const hasGeographies = useRef(false);
  const [position, setPosition] = useState<{ center: [number, number]; zoom: number }>({
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
  });

  useEffect(() => {
    if (hasGeographies.current && !loaded) setLoaded(true);
  });

  const zoom = position.zoom;

  return (
    <div className="relative select-none">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 rounded-2xl z-10">
          <p className="text-slate-500 text-sm animate-pulse">Cargando mapa…</p>
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: DEFAULT_CENTER, scale: 11500 }}
        width={820}
        height={420}
        style={{ width: '100%', height: 'auto', display: 'block', cursor: 'grab' }}
      >
        <ZoomableGroup
          center={position.center}
          zoom={zoom}
          minZoom={1}
          maxZoom={12}
          onMoveEnd={({ coordinates, zoom: z }) =>
            setPosition({ center: coordinates, zoom: z })
          }
        >
          <Geographies geography={GEO_URL}>
            {({ geographies, path }) => {
              if (geographies.length > 0) hasGeographies.current = true;
              const prGeos = geographies.filter(geo => String(geo.id).startsWith('72'));
              return (
                <>
                  {prGeos.map(geo => {
                    const geoId = String(geo.id);
                    const fill = getFill(geoId, highlightedFips, flashState);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke="#0f172a"
                        strokeWidth={0.8 / zoom}
                        onClick={() => onMunicipalityClick?.(geoId)}
                        style={{
                          default: { outline: 'none', cursor: interactive ? 'pointer' : 'grab' },
                          hover: {
                            fill: getHoverFill(geoId, highlightedFips, interactive),
                            outline: 'none',
                            cursor: interactive ? 'pointer' : 'grab',
                          },
                          pressed: { outline: 'none', cursor: interactive ? 'pointer' : 'grabbing' },
                        }}
                      />
                    );
                  })}
                  {showLabels && prGeos.map(geo => {
                    if (!highlightedFips.includes(String(geo.id))) return null;
                    const centroid: [number, number] = path.centroid(geo);
                    if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return null;
                    const muni = municipalityByFips.get(String(geo.id));
                    if (!muni) return null;
                    return (
                      <text
                        key={`label-${geo.id}`}
                        x={centroid[0]}
                        y={centroid[1]}
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{
                          fontSize: 9 / zoom,
                          fontWeight: '800',
                          fill: '#fde68a',
                          paintOrder: 'stroke',
                          stroke: '#0f172a',
                          strokeWidth: 3.5 / zoom,
                          strokeLinejoin: 'round' as const,
                          pointerEvents: 'none',
                          userSelect: 'none',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                      >
                        {muni.name}
                      </text>
                    );
                  })}
                </>
              );
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10">
        <button
          onClick={() => setPosition(p => ({ ...p, zoom: Math.min(12, p.zoom * 1.6) }))}
          className="w-8 h-8 rounded-lg bg-slate-700/90 hover:bg-slate-600 text-white text-lg font-bold leading-none flex items-center justify-center shadow border border-slate-600/50 transition-colors"
          aria-label="Acercar"
        >
          +
        </button>
        <button
          onClick={() => setPosition(p => ({ ...p, zoom: Math.max(1, p.zoom / 1.6) }))}
          className="w-8 h-8 rounded-lg bg-slate-700/90 hover:bg-slate-600 text-white text-lg font-bold leading-none flex items-center justify-center shadow border border-slate-600/50 transition-colors"
          aria-label="Alejar"
        >
          −
        </button>
        {zoom > 1.1 && (
          <button
            onClick={() => setPosition({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })}
            className="w-8 h-8 rounded-lg bg-slate-700/90 hover:bg-slate-600 text-slate-300 text-xs font-bold leading-none flex items-center justify-center shadow border border-slate-600/50 transition-colors"
            aria-label="Restablecer zoom"
          >
            ↺
          </button>
        )}
      </div>
    </div>
  );
}
