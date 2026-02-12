import { useEffect } from 'react';
import { MatchData, ViewState } from '@/lib/types';
import { saveMatchData } from '@/lib/dataService';

export function useMatchPersistence(matchData: MatchData, viewState: ViewState) {
    useEffect(() => {
        if (
            (viewState === 'match' || viewState === 'serving') &&
            matchData.matchId &&
            matchData.matchId !== 'initial-id'
        ) {
            saveMatchData(matchData.matchId, matchData);
            localStorage.setItem('lastActiveMatchId', matchData.matchId);
        }
    }, [matchData, viewState]);
}
