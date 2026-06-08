#!/usr/bin/env tsx
/**
 * Validates every notableBarrios entry in municipalities.ts against the
 * official Puerto Rico barrio list (sourced from US Census Bureau data).
 *
 * Usage:
 *   npx tsx scripts/validate-barrios.ts
 *
 * Data source:
 *   https://gist.github.com/janielMartell/e629fe1448fd312c1830880fca78340d
 *   (Census-based complete list of all official barrios for all 78 municipalities)
 */

import { municipalities } from '../data/municipalities';

const GIST_URL =
  'https://gist.githubusercontent.com/janielMartell/e629fe1448fd312c1830880fca78340d/raw';

// Community/sector names we intentionally keep because they are widely
// recognised landmarks, even though they are not standalone census barrios.
const KNOWN_COMMUNITY_NAMES = new Set([
  'Condado',        // sector within Santurce, San Juan
  'Hato Rey',       // collective name for Hato Rey Norte/Central/Sur, San Juan
  'Río Piedras',    // former municipality, now part of San Juan
  'Isla Verde',     // sector in Carolina (within Cangrejo Arriba barrio)
  'Villa Carolina', // large urbanization in Carolina
  'Levittown',      // major urbanization in Toa Baja
  'Isabel Segunda', // common name for the town of Vieques (= Barrio Pueblo)
  'Juana Matos',    // sector in Cataño
  'Amelia',         // sector in Cataño
]);

// Shorthand names that abbreviate a pair of official barrios
// (e.g. "Galateo" covers "Galateo Alto" and "Galateo Bajo").
const KNOWN_SHORTHANDS = new Set([
  'Galateo',        // Galateo Alto / Galateo Bajo (Isabela)
  'Felicia',        // Felicia I / Felicia II (Santa Isabel)
  'Tierras Nuevas', // Tierras Nuevas Poniente / Saliente (Manatí)
  'Bajura',         // Bajura Adentro / Afuera (Manatí)
  'Río Cañas',      // Río Cañas Abajo / Arriba (Mayagüez, Juana Díaz)
  'Pugnado',        // Pugnado Adentro / Afuera (Vega Baja)
  'Mameyes',        // Mameyes I / II or Mameyes Arriba (multiple municipalities)
]);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/\s+/g, ' ')
    .trim();
}

/** Parse the CSV gist into a map: normalised municipality name → Set of barrio names */
async function fetchOfficialBarrios(): Promise<Map<string, Set<string>>> {
  const response = await fetch(GIST_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  const csv = await response.text();
  const lines = csv.trim().split('\n').slice(1); // skip header

  const byMunicipality = new Map<string, Set<string>>();

  for (const line of lines) {
    // Each line: "Municipio","Barrio"
    const match = line.match(/^"([^"]+)","([^"]+)"$/);
    if (!match) continue;
    const [, municipio, barrio] = match;
    const key = normalize(municipio);
    if (!byMunicipality.has(key)) byMunicipality.set(key, new Set());
    byMunicipality.get(key)!.add(barrio);
  }

  return byMunicipality;
}

type CheckResult = 'valid' | 'partial' | 'community' | 'invalid';

function checkBarrio(barrio: string, officialBarrios: Set<string>): CheckResult {
  if (barrio === 'Pueblo') return 'valid'; // every municipality has Barrio Pueblo
  if (KNOWN_COMMUNITY_NAMES.has(barrio)) return 'community';
  if (KNOWN_SHORTHANDS.has(barrio)) return 'partial';

  const norm = normalize(barrio);
  const officialNorms = [...officialBarrios].map(normalize);

  // Exact match
  if (officialNorms.includes(norm)) return 'valid';

  // Partial match: the entry is a clear prefix of an official barrio name
  // (catches things like "Mameyes II" matching "Mameyes II" exactly, or
  //  "Mameyes Arriba" matching when stored without the qualifier)
  const hasPartial = officialNorms.some(
    o => o.startsWith(norm + ' ') || norm.startsWith(o + ' ')
  );
  if (hasPartial) return 'partial';

  return 'invalid';
}

async function main() {
  console.log('Fetching official Puerto Rico barrio list...\n');

  let officialData: Map<string, Set<string>>;
  try {
    officialData = await fetchOfficialBarrios();
    const totalBarrios = [...officialData.values()].reduce((n, s) => n + s.size, 0);
    console.log(`Loaded ${totalBarrios} official barrios across ${officialData.size} municipalities.\n`);
  } catch (err) {
    console.error('❌ Failed to fetch barrio data:', (err as Error).message);
    process.exit(1);
  }

  let validCount = 0;
  let partialCount = 0;
  let communityCount = 0;
  let invalidCount = 0;

  const issueList: Array<{ name: string; lines: string[] }> = [];

  for (const municipality of municipalities) {
    const key = normalize(municipality.name);
    const officialBarrios = officialData.get(key) ?? new Set<string>();

    if (officialBarrios.size === 0) {
      issueList.push({
        name: municipality.name,
        lines: [`  ⚠️  Municipality name "${municipality.name}" not found in official data.`],
      });
      continue;
    }

    const lines: string[] = [];

    for (const barrio of municipality.notableBarrios) {
      const result = checkBarrio(barrio, officialBarrios);
      if (result === 'valid') {
        validCount++;
      } else if (result === 'partial') {
        partialCount++;
        lines.push(`  ⚠️  "${barrio}" — shorthand for multiple barrios (intentional)`);
      } else if (result === 'community') {
        communityCount++;
        lines.push(`  ℹ️  "${barrio}" — known community/sector name (not a census barrio)`);
      } else {
        invalidCount++;
        lines.push(`  ❌ "${barrio}" — NOT in official barrio list for ${municipality.name}`);
      }
    }

    if (lines.length > 0) issueList.push({ name: municipality.name, lines });
  }

  if (issueList.length > 0) {
    console.log('=== Findings by Municipality ===\n');
    for (const { name, lines } of issueList) {
      console.log(`${name}:`);
      lines.forEach(l => console.log(l));
      console.log();
    }
  }

  const totalChecked = validCount + partialCount + communityCount + invalidCount;
  console.log('=== Summary ===');
  console.log(`Checked ${totalChecked} barrio entries across ${municipalities.length} municipalities.\n`);
  console.log(`✅  Verified (exact match):              ${validCount}`);
  console.log(`⚠️   Shorthand (partial — intentional):  ${partialCount}`);
  console.log(`ℹ️   Community name (intentional):        ${communityCount}`);
  console.log(`❌  Not found in official list:          ${invalidCount}`);

  if (invalidCount === 0) {
    console.log('\n🎉 All official barrio entries verified against the Census-based dataset!');
    console.log('   The ℹ️ and ⚠️ entries above are intentional and documented in the script.');
  } else {
    console.log(`\n${invalidCount} entry/entries failed. Fix the ❌ items above, then re-run.`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
