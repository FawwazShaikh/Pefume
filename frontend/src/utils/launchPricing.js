// ── Launch Pricing Utilities ─────────────────────────────────────────────────
// All functions here are pure — no React, no side-effects.
//
// Campaign window is controlled entirely by two Vercel environment variables:
//   VITE_LAUNCH_START_DATE  — ISO 8601, campaign becomes visible at this moment
//   VITE_LAUNCH_END_DATE    — ISO 8601, campaign disappears at this moment
//
// States:
//   Before start  → normal price only
//   start ≤ now ≤ end → Launch Collection Pricing UI + countdown
//   After end     → normal price only (automatic, no redeploy needed)
//
// To deploy a new campaign window, update both env vars in Vercel and redeploy
// once. The feature then manages itself for the entire window automatically.

export const SALE_START_DATE = import.meta.env.VITE_LAUNCH_START_DATE
  ? new Date(import.meta.env.VITE_LAUNCH_START_DATE)
  : null;

export const SALE_END_DATE = import.meta.env.VITE_LAUNCH_END_DATE
  ? new Date(import.meta.env.VITE_LAUNCH_END_DATE)
  : null;

export const CAMPAIGN_PHASE = {
  PRE_LAUNCH: 'PRE_LAUNCH',
  LIVE_LAUNCH: 'LIVE_LAUNCH',
  POST_LAUNCH: 'POST_LAUNCH'
};

/**
 * Returns the current campaign phase.
 *
 * @param {Date|null} startDate
 * @param {Date|null} endDate
 * @returns {string} One of CAMPAIGN_PHASE values
 */
export function getCampaignPhase(startDate, endDate) {
  if (!startDate || isNaN(startDate.getTime())) return CAMPAIGN_PHASE.POST_LAUNCH;
  if (!endDate   || isNaN(endDate.getTime()))   return CAMPAIGN_PHASE.POST_LAUNCH;

  const now = Date.now();
  if (now < startDate.getTime()) {
    return CAMPAIGN_PHASE.PRE_LAUNCH;
  } else if (now >= startDate.getTime() && now < endDate.getTime()) {
    return CAMPAIGN_PHASE.LIVE_LAUNCH;
  } else {
    return CAMPAIGN_PHASE.POST_LAUNCH;
  }
}

/**
 * Returns true only when the current moment falls inside the campaign window.
 * Called on every render (the hook re-renders every second so this stays fresh).
 *
 * @param {Date|null} startDate
 * @param {Date|null} endDate
 * @returns {boolean}
 */
export function isCampaignActive(startDate, endDate) {
  return getCampaignPhase(startDate, endDate) === CAMPAIGN_PHASE.LIVE_LAUNCH;
}


/**
 * Computes a display MRP that is approximately 10% above the selling price,
 * always rounded UP to the nearest premium psychological price ending.
 *
 * The algorithm:
 *   1. Multiply sellingPrice by 1.10 to get the raw target.
 *   2. Find the first anchor in the premium endings list that is strictly
 *      greater than the raw target — this guarantees we always round UP.
 *   3. For prices beyond the anchors list, fall back to the next ×100 ceiling
 *      with a 99 suffix (e.g. 2599 → 2699, etc.).
 *
 * Example results (matches the approved pricing table):
 *   349  → 10% = 383.9  → 399  ✓
 *   449  → 10% = 493.9  → 499  ✓
 *   699  → 10% = 768.9  → 799  ✓
 *   999  → 10% = 1098.9 → 1099 ✓
 *   1499 → 10% = 1648.9 → 1649 ✓
 *   1999 → 10% = 2198.9 → 2199 ✓
 *
 * @param {number} sellingPrice - The database selling price (never mutated).
 * @returns {number} The display MRP.
 */
export function computeDisplayMrp(sellingPrice) {
  const raw = sellingPrice * 1.10;

  // Premium psychological price anchors in ascending order.
  // Always round UP — we pick the first anchor strictly greater than raw.
  const anchors = [
     49,  99, 149, 199, 249, 299, 349, 399, 449, 499,
    549, 599, 649, 699, 749, 799, 849, 899, 949, 999,
    1049, 1099, 1149, 1199, 1249, 1299, 1349, 1399, 1449, 1499,
    1549, 1599, 1649, 1699, 1749, 1799, 1849, 1899, 1949, 1999,
    2099, 2199, 2299, 2399, 2499, 2649, 2799, 2999, 3199, 3499,
  ];

  const found = anchors.find((a) => a > raw);
  if (found !== undefined) return found;

  // Fallback for very high prices: ceil to the next hundred, add 99 suffix
  const hundredCeil = Math.ceil(raw / 100) * 100;
  return hundredCeil - 1; // e.g. 3500 → 3499, 4000 → 3999
}

/**
 * Computes the remaining time between now and endDate.
 * Returns an object suitable for direct rendering with no React dependency.
 *
 * @param {Date|null} endDate
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, expired: boolean }}
 */
export function computeRemainingTime(endDate) {
  if (!endDate || isNaN(endDate.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const diffMs = endDate.getTime() - Date.now();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, expired: false };
}
