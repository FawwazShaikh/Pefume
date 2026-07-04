import { useState, useEffect } from 'react';
import {
  computeRemainingTime,
  getCampaignPhase,
  CAMPAIGN_PHASE
} from '../utils/launchPricing';

/**
 * useLaunchCountdown
 *
 * Subscribes to a 1-second interval and returns both the current campaign
 * phase and the remaining time until the active boundary (start or end date).
 * Cleans up the interval on unmount — no memory leaks.
 *
 * @param {Date|null} startDate - The campaign start date.
 * @param {Date|null} endDate - The campaign end date.
 * @returns {{
 *   phase: string,
 *   remaining: { days: number, hours: number, minutes: number, seconds: number, expired: boolean }
 * }}
 */
export function useLaunchCountdown(startDate, endDate) {
  const [state, setState] = useState(() => {
    const currentPhase = getCampaignPhase(startDate, endDate);
    const targetDate = currentPhase === CAMPAIGN_PHASE.PRE_LAUNCH ? startDate : endDate;
    return {
      phase: currentPhase,
      remaining: computeRemainingTime(targetDate)
    };
  });

  useEffect(() => {
    if (!startDate || isNaN(startDate.getTime()) || !endDate || isNaN(endDate.getTime())) {
      setState({
        phase: CAMPAIGN_PHASE.POST_LAUNCH,
        remaining: { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
      });
      return;
    }

    const updateTimer = () => {
      const currentPhase = getCampaignPhase(startDate, endDate);
      const targetDate = currentPhase === CAMPAIGN_PHASE.PRE_LAUNCH ? startDate : endDate;
      const rem = computeRemainingTime(targetDate);
      setState({
        phase: currentPhase,
        remaining: rem
      });
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [startDate, endDate]);

  return state;
}
