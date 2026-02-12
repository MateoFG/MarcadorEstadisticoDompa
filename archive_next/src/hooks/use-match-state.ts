"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import {
    MatchData,
    PointType,
    PointCounts,
    SetScore,
    PointCategory,
    ViewState,
    DialogConfig,
    TeamColors
} from '@/lib/types';
import {
    saveMatchData,
    loadMatchData,
    saveCompletedMatch,
    isMatchCompleted
} from '@/lib/dataService';
import {
    getInitialMatchData,
    SETS_TO_WIN_MATCH,
    SET_POINTS_REGULAR,
    SET_POINTS_DECIDER,
    REQUIRED_POINT_DIFFERENCE
} from '@/lib/constants';
import { calculateSetReport } from '@/lib/calculations';

export function useMatchState() {
    const { t } = useTranslation();
    const { toast } = useToast();

    const [matchData, setMatchData] = useState<MatchData>(() => getInitialMatchData(t('homeTeam'), t('rivalTeam')));
    const [viewState, setViewState] = useState<ViewState>('start');
    const [isMounted, setIsMounted] = useState(false);
    const [isMatchSaved, setIsMatchSaved] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

    const prevCanEndSet = useRef(false);

    // 1. Initial Load
    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
            const savedMatchId = localStorage.getItem('lastActiveMatchId');
            if (savedMatchId) {
                const loadedData = loadMatchData(savedMatchId);
                if (loadedData) {
                    setMatchData(loadedData);
                    if (loadedData.isMatchOver) {
                        setViewState('report');
                        if (isMatchCompleted(loadedData.matchId)) {
                            setIsMatchSaved(true);
                        }
                    } else if (loadedData.firstServeBy.length > 0 && loadedData.firstServeBy[loadedData.currentSet - 1]) {
                        setViewState('match');
                    } else {
                        if (loadedData.currentSetPointsLog.length === 0) {
                            setViewState('serving');
                        } else {
                            setViewState('match');
                        }
                    }
                } else {
                    if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
                        localStorage.removeItem('lastActiveMatchId');
                    }
                    setViewState('start');
                }
            } else {
                setViewState('start');
            }
        } else {
            // Fallback for SSR or non-browser env
            setViewState('start');
        }
    }, []);

    // 2. Persistence
    useEffect(() => {
        if ((viewState === 'match' || viewState === 'serving') && matchData.matchId && isMounted) {
            saveMatchData(matchData.matchId, matchData);
            if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
                localStorage.setItem('lastActiveMatchId', matchData.matchId);
            }
        }
    }, [matchData, viewState, isMounted]);

    // 3. Theme Colors
    useEffect(() => {
        if (isMounted && matchData.teamColors) {
            document.documentElement.style.setProperty('--accent-hsl', matchData.teamColors.own);
            document.documentElement.style.setProperty('--destructive-hsl', matchData.teamColors.rival);
        }
    }, [matchData.teamColors, isMounted]);

    // 4. Memos
    const currentSetPointCounts = useMemo((): PointCounts => {
        return matchData.currentSetPointsLog.reduce(
            (counts, log) => {
                counts[log.type]++;
                return counts;
            },
            { PPM: 0, PRE: 0, PPE: 0, PRM: 0 }
        );
    }, [matchData.currentSetPointsLog]);

    const currentSetScore = useMemo((): SetScore => {
        const own = currentSetPointCounts.PPM + currentSetPointCounts.PRE;
        const rival = currentSetPointCounts.PPE + currentSetPointCounts.PRM;
        return { own, rival };
    }, [currentSetPointCounts]);

    const servingTeam = useMemo((): 'own' | 'rival' | null => {
        const currentPointLog = matchData.currentSetPointsLog;
        if (currentPointLog.length === 0) {
            return matchData.firstServeBy[matchData.currentSet - 1] || null;
        }
        const lastPoint = currentPointLog[currentPointLog.length - 1];
        if (lastPoint.type === 'PPM' || lastPoint.type === 'PRE') {
            return 'own';
        }
        return 'rival';
    }, [matchData.currentSetPointsLog, matchData.currentSet, matchData.firstServeBy]);

    const getNextRotation = (current: number): number => {
        return current === 1 ? 6 : current - 1;
    };

    const getPrevRotation = (current: number): number => {
        return current === 6 ? 1 : current + 1;
    };

    const canEndSet = useMemo(() => {
        if (matchData.isMatchOver) return false;
        const { own: ownScore, rival: rivalScore } = currentSetScore;
        const isDeciderSet = matchData.setsWon.own === SETS_TO_WIN_MATCH - 1 && matchData.setsWon.rival === SETS_TO_WIN_MATCH - 1;
        const targetScore = isDeciderSet ? SET_POINTS_DECIDER : SET_POINTS_REGULAR;

        const ownHasReachedTarget = ownScore >= targetScore;
        const rivalHasReachedTarget = rivalScore >= targetScore;
        const ownHasLead = ownScore - rivalScore >= REQUIRED_POINT_DIFFERENCE;
        const rivalHasLead = rivalScore - ownScore >= REQUIRED_POINT_DIFFERENCE;

        return (ownHasReachedTarget && ownHasLead) || (rivalHasReachedTarget && rivalHasLead);
    }, [matchData.isMatchOver, matchData.setsWon, currentSetScore]);

    const canResetCurrentSet = useMemo(() => {
        return matchData.currentSetPointsLog.length > 0;
    }, [matchData.currentSetPointsLog.length]);

    // 5. Handlers
    const handleAddPoint = useCallback((type: PointType, category: PointCategory) => {
        if (matchData.isMatchOver) return;

        setMatchData((prevData) => {
            const isOwnPoint = type === 'PPM' || type === 'PRE';
            const wasRivalServing = servingTeam === 'rival';
            const isSideout = isOwnPoint && wasRivalServing;

            const newRotation = isSideout ? getNextRotation(prevData.currentRotation) : prevData.currentRotation;

            return {
                ...prevData,
                currentSetPointsLog: [...prevData.currentSetPointsLog, { type, category, rotation: prevData.currentRotation }],
                currentRotation: newRotation
            };
        });
    }, [matchData.isMatchOver, servingTeam]);

    const handleUndo = useCallback(() => {
        if (matchData.isMatchOver) return;
        setMatchData((prevData) => {
            if (prevData.currentSetPointsLog.length === 0) return prevData;

            const lastLog = prevData.currentSetPointsLog[prevData.currentSetPointsLog.length - 1];
            // To undo rotation, we look at the rotation stored in the log we are removing.
            // That was the "current" rotation when that point was played.
            // If the rotation changed *after* that point, we should revert to it.
            return {
                ...prevData,
                currentSetPointsLog: prevData.currentSetPointsLog.slice(0, -1),
                currentRotation: lastLog.rotation
            };
        });
    }, [matchData.isMatchOver]);

    const handleEndSet = useCallback(() => {
        if (!canEndSet) return;

        setMatchData((prevData) => {
            const firstServer = prevData.firstServeBy[prevData.currentSet - 1];
            const report = calculateSetReport(prevData.currentSet, currentSetPointCounts, currentSetScore, prevData.currentSetPointsLog, firstServer);

            const newSetsWon = { ...prevData.setsWon };
            if (currentSetScore.own > currentSetScore.rival) newSetsWon.own++;
            else newSetsWon.rival++;

            const isMatchOver = newSetsWon.own === SETS_TO_WIN_MATCH || newSetsWon.rival === SETS_TO_WIN_MATCH;
            const winner = currentSetScore.own > currentSetScore.rival ? prevData.teamNames.own : prevData.teamNames.rival;

            setTimeout(() => {
                toast({
                    title: isMatchOver ? t('matchFinished') : t('setForWinner', { winner }),
                    description: t('setScoreWas', { own: currentSetScore.own, rival: currentSetScore.rival }),
                });
            }, 0);

            const updatedMatchHistory = [...prevData.matchHistory, report];

            if (isMatchOver) {
                const finalData = {
                    ...prevData,
                    matchHistory: updatedMatchHistory,
                    setsWon: newSetsWon,
                    currentSet: prevData.currentSet + 1,
                    currentSetPointsLog: [],
                    isMatchOver: true,
                };
                setViewState('report');
                return finalData;
            }

            const isNextSetDecider = newSetsWon.own === SETS_TO_WIN_MATCH - 1 && newSetsWon.rival === SETS_TO_WIN_MATCH - 1;
            const newFirstServeBy = [...prevData.firstServeBy];

            if (isNextSetDecider) {
                setViewState('serving');
            } else {
                const lastSetFirstServer = prevData.firstServeBy[prevData.currentSet - 1];
                newFirstServeBy[prevData.currentSet] = lastSetFirstServer === 'own' ? 'rival' : 'own';
            }

            return {
                ...prevData,
                matchHistory: updatedMatchHistory,
                setsWon: newSetsWon,
                currentSet: prevData.currentSet + 1,
                currentSetPointsLog: [],
                isMatchOver: false,
                firstServeBy: newFirstServeBy,
                currentRotation: prevData.startingRotations[prevData.currentSet] || 1 // Set up next rotation if already known
            };
        });
    }, [canEndSet, currentSetScore, currentSetPointCounts, toast, matchData.teamNames, t]);

    const openDialog = useCallback((config: DialogConfig) => {
        setDialogConfig(config);
    }, []);

    const closeDialog = useCallback(() => setDialogConfig(null), []);

    // 6. Dialog check effect
    useEffect(() => {
        if (viewState === 'match' && canEndSet && !prevCanEndSet.current) {
            setTimeout(() => {
                const ownSets = matchData.setsWon.own + (currentSetScore.own > currentSetScore.rival ? 1 : 0);
                const rivalSets = matchData.setsWon.rival + (currentSetScore.rival > currentSetScore.own ? 1 : 0);
                const isMatchEnding = ownSets === SETS_TO_WIN_MATCH || rivalSets === SETS_TO_WIN_MATCH;
                const winner = currentSetScore.own > currentSetScore.rival ? matchData.teamNames.own : matchData.teamNames.rival;

                openDialog({
                    title: t('endSetQuestion', { setNumber: matchData.currentSet }),
                    description: t('setWinnerDescription', { winner, ownScore: currentSetScore.own, rivalScore: currentSetScore.rival }),
                    confirmText: isMatchEnding ? t('endMatch') : t('newSet'),
                    cancelText: t('undo'),
                    onConfirm: handleEndSet,
                    onCancel: handleUndo
                });
            }, 0);
        }
        prevCanEndSet.current = canEndSet;
    }, [canEndSet, viewState, matchData, currentSetScore, handleEndSet, handleUndo, t, openDialog]);

    const handleTeamNameChange = useCallback((team: 'own' | 'rival', newName: string) => {
        setMatchData((prevData) => ({
            ...prevData,
            teamNames: { ...prevData.teamNames, [team]: newName },
        }));
    }, []);

    const handleTeamColorChange = useCallback((team: 'own' | 'rival', newColor: string) => {
        setMatchData((prevData) => ({
            ...prevData,
            teamColors: { ...prevData.teamColors, [team]: newColor },
        }));
    }, []);

    const handleStartMatch = useCallback((ownTeamName: string, rivalTeamName: string, teamColors: TeamColors, location: string, date: string, time: string, startingRotation: number) => {
        const newMatch = getInitialMatchData(ownTeamName, rivalTeamName, teamColors, location, date, time);
        newMatch.startingRotations[0] = startingRotation;
        newMatch.currentRotation = startingRotation;
        setMatchData(newMatch);
        setViewState('serving');
        setIsMatchSaved(false);
        saveMatchData(newMatch.matchId, newMatch);
        if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
            localStorage.setItem('lastActiveMatchId', newMatch.matchId);
        }
    }, []);

    const handleSelectFirstServe = useCallback((servingTeam: 'own' | 'rival') => {
        setMatchData(prevData => {
            const newFirstServeBy = [...prevData.firstServeBy];
            newFirstServeBy[prevData.currentSet - 1] = servingTeam;

            // If we are NOT serving first, we are receiving.
            // When we win the first sideout, we will rotate.
            // So we start in startingRotation.
            return {
                ...prevData,
                firstServeBy: newFirstServeBy,
                currentRotation: prevData.startingRotations[prevData.currentSet - 1] || 1
            };
        });
        setViewState('match');
    }, []);

    const handleResetCurrentSet = useCallback(() => {
        if (canResetCurrentSet) {
            setMatchData((prev) => ({ ...prev, currentSetPointsLog: [] }));
        }
    }, [canResetCurrentSet]);

    const handleEndMatch = useCallback(() => {
        setMatchData((prev) => ({ ...prev, isMatchOver: true }));
        setViewState('report');
    }, []);

    const handleSaveMatch = useCallback(() => {
        saveCompletedMatch(matchData);
        if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
            localStorage.removeItem('lastActiveMatchId');
        }
        toast({ title: t('matchSaved'), description: t('matchSavedToHistory') });
        setIsMatchSaved(true);
    }, [matchData, t, toast]);

    const handleStartNewMatch = useCallback(() => {
        if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
            localStorage.removeItem('lastActiveMatchId');
        }
        setMatchData(getInitialMatchData(t('homeTeam'), t('rivalTeam')));
        setIsMatchSaved(false);
        setViewState('start');
    }, [t]);

    const handleViewHistory = useCallback(() => {
        setViewState('history');
    }, []);

    const handleSelectHistoryMatch = useCallback((match: MatchData) => {
        setMatchData(match);
        setIsMatchSaved(true);
        setViewState('report');
    }, []);

    const handleRotationChange = useCallback((newRotation: number) => {
        setMatchData(prev => ({ ...prev, currentRotation: newRotation }));
    }, []);

    return {
        matchData,
        viewState,
        setViewState,
        isMounted,
        isMatchSaved,
        dialogConfig,
        currentSetPointCounts,
        currentSetScore,
        servingTeam,
        canEndSet,
        canResetCurrentSet,
        handleAddPoint,
        handleUndo,
        handleEndSet,
        handleTeamNameChange,
        handleTeamColorChange,
        handleStartMatch,
        handleSelectFirstServe,
        handleResetCurrentSet,
        handleEndMatch,
        handleSaveMatch,
        handleStartNewMatch,
        handleViewHistory,
        handleSelectHistoryMatch,
        handleRotationChange,
        openDialog,
        closeDialog
    };
}
