import { initialTeamColors } from './constants';
import type { MatchData, PointLog, SetReport } from './types';
import { calculateSetReport } from './calculations';

const ACTIVE_MATCH_PREFIX = 'match_data_';
const COMPLETED_MATCHES_KEY = 'completed_matches';

// --- Completed Matches ---

export const getCompletedMatches = (): MatchData[] => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') return [];
  try {
    const completedIndex = localStorage.getItem(COMPLETED_MATCHES_KEY);
    if (!completedIndex) return [];

    const matchIds = JSON.parse(completedIndex) as string[];
    const matches = matchIds
      .map(id => loadMatchData(id))
      .filter((match): match is MatchData => match !== null);

    // Sort by date, most recent first
    matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return matches;
  } catch (error) {
    console.error('Failed to get completed matches:', error);
    return [];
  }
};

export const isMatchCompleted = (matchId: string): boolean => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') return false;
  try {
    const completedIndex = localStorage.getItem(COMPLETED_MATCHES_KEY);
    if (!completedIndex) return false;
    const matchIds = JSON.parse(completedIndex) as string[];
    return matchIds.includes(matchId);
  } catch (error) {
    console.error('Failed to check if match is completed:', error);
    return false;
  }
};

export const saveCompletedMatch = (data: MatchData): void => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') return;
  try {
    // First, save the full match data
    saveMatchData(data.matchId, data);

    // Then, add its ID to the completed matches index
    const completedIndex = localStorage.getItem(COMPLETED_MATCHES_KEY);
    const matchIds = completedIndex ? JSON.parse(completedIndex) as string[] : [];

    if (!matchIds.includes(data.matchId)) {
      matchIds.push(data.matchId);
      localStorage.setItem(COMPLETED_MATCHES_KEY, JSON.stringify(matchIds));
    }
  } catch (error) {
    console.error('Failed to save completed match:', error);
  }
};

export const deleteCompletedMatch = (matchId: string): void => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') return;
  try {
    // First, remove the full match data
    deleteMatchData(matchId);

    // Then, remove its ID from the completed matches index
    const completedIndex = localStorage.getItem(COMPLETED_MATCHES_KEY);
    if (completedIndex) {
      const matchIds = JSON.parse(completedIndex) as string[];
      const newIndex = matchIds.filter(id => id !== matchId);
      localStorage.setItem(COMPLETED_MATCHES_KEY, JSON.stringify(newIndex));
    }
  } catch (error) {
    console.error('Failed to delete completed match:', error);
  }
};


// --- General Match Data Handling ---

export const saveMatchData = (matchId: string, data: MatchData): void => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(`${ACTIVE_MATCH_PREFIX}${matchId}`, serializedData);
    } catch (error) {
      console.error('Failed to save match data:', error);
    }
  }
};

export const loadMatchData = (matchId: string): MatchData | null => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
    try {
      const serializedData = localStorage.getItem(`${ACTIVE_MATCH_PREFIX}${matchId}`);
      if (serializedData === null) {
        return null;
      }
      let parsedData = JSON.parse(serializedData) as MatchData;

      // --- Data migration for backward compatibility ---

      // Add teamColors if missing
      if (!parsedData.teamColors) {
        parsedData.teamColors = initialTeamColors;
      }

      // Convert old point log format (string[]) to new format (PointLog[])
      const migratePointLog = (log: any[]): PointLog[] => {
        if (log && log.length > 0 && typeof log[0] === 'string') {
          return log.map((type: string) => ({ type, category: 'OTRO' } as PointLog));
        }
        return log || [];
      };

      parsedData.currentSetPointsLog = migratePointLog(parsedData.currentSetPointsLog);

      if (parsedData.matchHistory) {
        parsedData.matchHistory.forEach((set: SetReport, index) => {
          set.pointLog = migratePointLog(set.pointLog);

          // Recalculate advanced stats if they are missing
          if (!set.sideoutPercentage || !set.pointsPerServe || !set.breakPoints) {
            const recalculatedSet = calculateSetReport(
              set.setNumber,
              set.pointCounts,
              set.finalScore,
              set.pointLog,
              parsedData.firstServeBy[index] || null
            );
            // Replace the old set report with the recalculated one
            parsedData.matchHistory[index] = recalculatedSet;
          }
        });
      } else {
        parsedData.matchHistory = [];
      }

      return parsedData;
    } catch (error) {
      console.error('Failed to load or migrate match data:', error);
      // If loading/migration fails, it's safer to remove the corrupted data
      localStorage.removeItem(`${ACTIVE_MATCH_PREFIX}${matchId}`);
      return null;
    }
  }
  return null;
};

export const deleteMatchData = (matchId: string): void => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
    try {
      localStorage.removeItem(`${ACTIVE_MATCH_PREFIX}${matchId}`);
    } catch (error) {
      console.error('Failed to delete match data:', error);
    }
  }
};

