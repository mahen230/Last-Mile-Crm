/**
 * Automated Google Maps Commercial Store Extraction Script (Places API New)
 * Xpeedo Last Mile — Dadabari S.O. (PIN 324009) & Kota Beats (Beat 1 to Beat 34)
 *
 * Usage:
 *   npx tsx scripts/extractCommercialStores.ts --beat 1 --minYears 3 --out commercial_beat_1.json
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

interface CliArgs {
  beat: string;
  colonies: string[];
  pincode: string;
  minYears: number;
  maxPages: number;
  outFile: string;
}

function parseCliArgs(): CliArgs {
  const args = process.argv.slice(2);
  const getFlag = (name: string, fallback: string) => {
    const idx = args.indexOf(name);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const beat = getFlag('--beat', '1').replace(/^Beat\s*/i, '').trim();
  const coloniesRaw = getFlag('--colonies', 'Dadabari,Keshavpura,Basant Vihar');
  const pincode = getFlag('--pincode', '324009');
  const minYears = Number(getFlag('--minYears', '3'));
  const maxPages = Number(getFlag('--maxPages', '3'));
  const outFile = getFlag('--out', `commercial_beat_${beat}.json`);

  return {
    beat,
    colonies: coloniesRaw.split(',').map((s) => s.trim()).filter(Boolean),
    pincode,
    minYears: Number.isNaN(minYears) ? 3 : minYears,
    maxPages: Number.isNaN(maxPages) ? 3 : Math.min(3, Math.max(1, maxPages)),
    outFile,
  };
}

async function runExtraction() {
  const apiKey = (process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  if (!apiKey) {
    console.error('Error: GOOGLE_MAPS_API_KEY or VITE_GOOGLE_MAPS_API_KEY must be set in environment.');
    process.exit(1);
  }

  const cfg = parseCliArgs();
  const categories = [
    { key: 'Retail', query: `retail store shop ${cfg.colonies[0]} Dadabari Kota ${cfg.pincode}` },
    { key: 'Wholesale', query: `wholesale traders distributors ${cfg.colonies[0]} Kota ${cfg.pincode}` },
    { key: 'Services', query: `service center clinic bank consultancy ${cfg.colonies[0]} Kota ${cfg.pincode}` },
    { key: 'eMitra/CSC', query: `eMitra CSC center Jan Seva Kendra ${cfg.colonies[0]} Kota ${cfg.pincode}` },
  ];

  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.businessStatus',
    'places.types',
    'places.nationalPhoneNumber',
    'places.internationalPhoneNumber',
    'places.photos',
    'places.reviews',
    'places.userRatingCount',
    'places.rating',
    'places.googleMapsUri',
    'nextPageToken',
  ].join(',');

  const results = new Map<string, any>();

  for (const cat of categories) {
    let pageToken: string | undefined = undefined;
    for (let page = 0; page < cfg.maxPages; page++) {
      const body: Record<string, any> = {
        textQuery: cat.query,
        pageSize: 20,
        languageCode: 'en',
        regionCode: 'IN',
        locationBias: {
          circle: {
            center: { latitude: 25.1462, longitude: 75.8258 },
            radius: 4500.0,
          },
        },
      };
      if (pageToken) body.pageToken = pageToken;

      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask,
          'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`[${cat.key}] API HTTP ${res.status}: ${err}`);
        break;
      }

      const data: any = await res.json();
      const places: any[] = Array.isArray(data?.places) ? data.places : [];

      for (const p of places) {
        if (!p?.id || p.businessStatus !== 'OPERATIONAL') continue;
        const timestamps = (p.reviews || [])
          .map((r: any) => (r.publishTime ? new Date(r.publishTime).getTime() : NaN))
          .filter((ms: number) => !Number.isNaN(ms));
        const earliestMs = timestamps.length ? Math.min(...timestamps) : NaN;
        const reviewYears = !Number.isNaN(earliestMs)
          ? Number(((Date.now() - earliestMs) / (365.25 * 86400 * 1000)).toFixed(1))
          : 0;
        const footfallYears = reviewYears >= 2 && (p.userRatingCount || 0) >= 60 ? 3.5 : 0;
        const operationYears = Math.max(reviewYears, footfallYears);

        if (operationYears < cfg.minYears) continue;

        if (!results.has(p.id)) {
          results.set(p.id, {
            placeId: p.id,
            storeName: p.displayName?.text || '',
            ownerName: 'Proprietor (Verify on Visit)',
            primaryPhone: p.nationalPhoneNumber || p.internationalPhoneNumber || '',
            latitude: p.location?.latitude,
            longitude: p.location?.longitude,
            fullAddress: p.formattedAddress || '',
            colony: cfg.colonies[0],
            pincode: cfg.pincode,
            beatNo: `Beat ${cfg.beat}`,
            category: cat.key,
            operationYears,
            googleMapsUri: p.googleMapsUri || '',
          });
        }
      }

      pageToken = data?.nextPageToken;
      if (!pageToken) break;
      await new Promise((r) => setTimeout(r, 350));
    }
  }

  const outPath = path.resolve(process.cwd(), cfg.outFile);
  const output = Array.from(results.values());
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Extracted ${output.length} verified ${cfg.minYears}+ year commercial entries for Beat ${cfg.beat} -> ${outPath}`);
}

runExtraction().catch((err) => {
  console.error('Commercial extraction failed:', err);
  process.exit(1);
});
