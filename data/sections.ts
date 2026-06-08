import type { Section } from '@/lib/types';

export const sections: Section[] = [
  {
    id: 1,
    title: 'Área Metro',
    emoji: '🏙️',
    description: 'La capital y sus municipios vecinos en la costa norte.',
    municipalityIds: ['san-juan', 'bayamon', 'carolina', 'guaynabo', 'trujillo-alto', 'catano', 'toa-baja', 'toa-alta'],
  },
  {
    id: 2,
    title: 'Costa Norte',
    emoji: '🏖️',
    description: 'Los municipios que bordean la costa norte, desde Dorado hasta Isabela.',
    municipalityIds: ['dorado', 'vega-alta', 'vega-baja', 'manati', 'barceloneta', 'florida', 'arecibo', 'hatillo', 'camuy', 'quebradillas', 'isabela'],
  },
  {
    id: 3,
    title: 'Noroeste',
    emoji: '🌊',
    description: 'Desde el interior montañoso hasta la costa oeste.',
    municipalityIds: ['san-sebastian', 'moca', 'aguadilla', 'aguada', 'anasco', 'rincon', 'mayaguez'],
  },
  {
    id: 4,
    title: 'Oeste y Suroeste',
    emoji: '🌅',
    description: 'La costa oeste y el interior suroeste de la isla.',
    municipalityIds: ['hormigueros', 'san-german', 'sabana-grande', 'lajas', 'cabo-rojo', 'guanica', 'yauco', 'guayanilla'],
  },
  {
    id: 5,
    title: 'Costa Sur',
    emoji: '☀️',
    description: 'Los municipios de la costa sur, incluyendo Ponce.',
    municipalityIds: ['penuelas', 'ponce', 'juana-diaz', 'santa-isabel', 'salinas', 'coamo'],
  },
  {
    id: 6,
    title: 'Sureste',
    emoji: '🐟',
    description: 'El sureste de la isla, con sus playas y lagunas.',
    municipalityIds: ['guayama', 'arroyo', 'patillas', 'maunabo', 'yabucoa', 'humacao', 'naguabo', 'las-piedras'],
  },
  {
    id: 7,
    title: 'Este',
    emoji: '🌿',
    description: 'El este de la isla, incluyendo Caguas y la entrada al Yunque.',
    municipalityIds: ['juncos', 'gurabo', 'san-lorenzo', 'caguas', 'aguas-buenas', 'canovanas', 'loiza', 'rio-grande'],
  },
  {
    id: 8,
    title: 'Noreste e Islas',
    emoji: '🏝️',
    description: 'La punta noreste y las islas municipio de Culebra y Vieques.',
    municipalityIds: ['luquillo', 'fajardo', 'ceiba', 'culebra', 'vieques'],
  },
  {
    id: 9,
    title: 'Cordillera Central',
    emoji: '⛰️',
    description: 'Las alturas del centro de la isla, pueblos frescos y cafetaleros.',
    municipalityIds: ['cayey', 'cidra', 'villalba', 'aibonito', 'barranquitas', 'comerio', 'naranjito', 'corozal', 'orocovis'],
  },
  {
    id: 10,
    title: 'Interior Montañoso',
    emoji: '🌄',
    description: 'El interior profundo de la Cordillera y el noroeste interior.',
    municipalityIds: ['morovis', 'ciales', 'utuado', 'jayuya', 'adjuntas', 'lares', 'las-marias', 'maricao'],
  },
];

export const sectionById = new Map(sections.map(s => [s.id, s]));
