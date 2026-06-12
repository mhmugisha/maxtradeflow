// components/v2/tools/instrumentKinds.js — calculator instrument sets derived
// from lib/instruments.js (never a hardcoded duplicate). The legacy
// calculators supported exactly the non-crypto set (11 FX + 3 indices +
// gold); crypto pip/contract conventions were never defined there, so the
// ported math doesn't offer crypto either.

import { INSTRUMENTS } from '@/lib/instruments';

/** 15 instruments: forex + indices + commodities (the legacy calculator set). */
export const CALC_INSTRUMENTS = INSTRUMENTS.filter((i) =>
  ['forex', 'indices', 'commodities'].includes(i.assetClass)
);

/** 12 instruments: forex pairs + gold (the legacy pip-calculator set). */
export const FX_AND_METAL = INSTRUMENTS.filter((i) =>
  ['forex', 'commodities'].includes(i.assetClass)
);

export const isJpyPair = (i) => i.assetClass === 'forex' && i.decimals === 3;
export const isIndex = (i) => i.assetClass === 'indices';
export const isMetal = (i) => i.assetClass === 'commodities';
