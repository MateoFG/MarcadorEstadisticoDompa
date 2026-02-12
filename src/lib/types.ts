export type PointCategory = 'SAQUE' | 'ATAQUE' | 'RECEPCION' | 'DEFENSA' | 'BLOQUEO' | 'OTRO';
export type PointType = 'PPM' | 'PRE' | 'PPE' | 'PRM';

export interface PointLog {
  type: PointType;
  category: PointCategory;
  ownRotation: number;
  rivalRotation: number;
}

export interface PointCounts {
  PPM: number;
  PRE: number;
  PPE: number;
  PRM: number;
}

export interface SetScore {
  own: number;
  rival: number;
}

export interface AdvancedSetStats {
  sideoutPercentage: {
    own: number;
    rival: number;
  };
  pointsPerServe: {
    own: number;
    rival: number;
  };
  breakPoints: {
    own: number;
    rival: number;
  };
}

export interface SetReport extends AdvancedSetStats {
  setNumber: number;
  finalScore: SetScore;
  pointCounts: PointCounts;
  ownEfficiency: number;
  rivalErrorImpact: number;
  pointLog: PointLog[];
  rotationStats: Record<number, { gp: number; sideouts: number; sideoutChances: number; }>;
  rivalRotationStats: Record<number, { gp: number; sideouts: number; sideoutChances: number; }>;
}

export interface TeamColors {
  own: string;
  rival: string;
}

export interface MatchData {
  teamNames: {
    own: string;
    rival: string;
  };
  teamColors: TeamColors;
  location: string;
  date: string;
  time: string;
  currentSet: number;
  currentSetPointsLog: PointLog[];
  setsWon: {
    own: number;
    rival: number;
  };
  matchHistory: SetReport[];
  isMatchOver: boolean;
  matchId: string;
  firstServeBy: ('own' | 'rival' | null)[];
  startingRotations: { own: number; rival: number }[]; // Starting rotations per set
  currentRotation: { own: number; rival: number };     // Current rotations (1-6)
}

export type ViewState = 'start' | 'serving' | 'match' | 'history' | 'report';

export type DialogConfig = {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};
