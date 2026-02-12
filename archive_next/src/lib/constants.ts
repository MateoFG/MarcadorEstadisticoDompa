import { v4 as uuidv4 } from 'uuid';
import type { MatchData, PointCounts, SetScore, TeamColors } from './types';

export const SET_POINTS_REGULAR = 25;
export const SET_POINTS_DECIDER = 15;
export const REQUIRED_POINT_DIFFERENCE = 2;
export const SETS_TO_WIN_MATCH = 3;

export const initialPointCounts: PointCounts = { PPM: 0, PRE: 0, PPE: 0, PRM: 0 };
export const initialSetScore: SetScore = { own: 0, rival: 0 };
export const initialTeamColors: TeamColors = { own: '145 63% 49%', rival: '0 84% 60%' };

export const getInitialMatchData = (
  ownTeamName: string = 'Home Team',
  rivalTeamName: string = 'Rival Team',
  teamColors: TeamColors = initialTeamColors,
  location: string = '',
  date: string = '',
  time: string = ''
): MatchData => ({
  teamNames: { own: ownTeamName, rival: rivalTeamName },
  teamColors,
  location,
  date,
  time,
  currentSet: 1,
  currentSetPointsLog: [],
  setsWon: { own: 0, rival: 0 },
  matchHistory: [],
  isMatchOver: false,
  matchId: uuidv4(),
  firstServeBy: [],
  startingRotations: [],
  currentRotation: 1,
});
