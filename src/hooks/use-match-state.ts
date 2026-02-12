import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import {
    MatchData,
    PointType,
    PointCategory,
    ViewState,
    DialogConfig,
    TeamColors
} from '@/lib/types';
import {
    loadMatchData,
    saveCompletedMatch,
    isMatchCompleted,
    saveMatchData
} from '@/lib/dataService';
import {
    getInitialMatchData,
    SETS_TO_WIN_MATCH,
    SET_POINTS_REGULAR,
    SET_POINTS_DECIDER,
    REQUIRED_POINT_DIFFERENCE
} from '@/lib/constants';
import {
    calculateSetReport,
    calculatePointCounts,
    calculateScore,
    determineServingTeam
} from '@/lib/calculations';
import { useDialog } from './use-dialog';
import { useMatchPersistence } from './use-match-persistence';


export function useMatchState() {
    const { t } = useTranslation();
    const { toast } = useToast();

    const [matchData, setMatchData] = useState<MatchData>(() => {
        const savedMatchId = localStorage.getItem('lastActiveMatchId');
        if (savedMatchId) {
            const loadedData = loadMatchData(savedMatchId);
            if (loadedData) return loadedData;
        }
        return getInitialMatchData(t('homeTeam'), t('rivalTeam'));
    });

    const [viewState, setViewState] = useState<ViewState>(() => {
        if (matchData.matchId !== 'initial-id') { // If we loaded something
            if (matchData.isMatchOver) return 'report';
            if (matchData.firstServeBy.length > 0 && matchData.firstServeBy[matchData.currentSet - 1]) return 'match';
            return 'serving';
        }
        return 'start';
    });

    const [isMatchSaved, setIsMatchSaved] = useState(() => isMatchCompleted(matchData.matchId));
    const { dialogConfig, openDialog, closeDialog } = useDialog();
    const prevCanEndSet = useRef(false);

    // Persistence
    useMatchPersistence(matchData, viewState);

    // Theme Colors
    useEffect(() => {
        if (matchData.teamColors) {
            document.documentElement.style.setProperty('--accent-hsl', matchData.teamColors.own);
            document.documentElement.style.setProperty('--destructive-hsl', matchData.teamColors.rival);
        }
    }, [matchData.teamColors]);

    // Derived State
    const currentSetPointCounts = useMemo(() =>
        calculatePointCounts(matchData.currentSetPointsLog),
        [matchData.currentSetPointsLog]);

    const currentSetScore = useMemo(() =>
        calculateScore(currentSetPointCounts),
        [currentSetPointCounts]);

    const servingTeam = useMemo(() =>
        determineServingTeam(matchData.currentSetPointsLog, matchData.currentSet, matchData.firstServeBy),
        [matchData.currentSetPointsLog, matchData.currentSet, matchData.firstServeBy]);

    const getNextRotation = (current: number): number => {
        return current === 1 ? 6 : current - 1;
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


    // Handlers
    const handleAddPoint = useCallback((type: PointType, category: PointCategory) => {
        if (matchData.isMatchOver) return;

        setMatchData((prevData) => {
            const isOwnPoint = type === 'PPM' || type === 'PRE';
            const wasOwnServing = servingTeam === 'own';
            const wasRivalServing = servingTeam === 'rival';

            // Sideout Logic: Only rotate if the team was receiving and won the point
            const ownSideout = isOwnPoint && wasRivalServing;
            const rivalSideout = !isOwnPoint && wasOwnServing;

            const newOwnRotation = ownSideout ? getNextRotation(prevData.currentRotation.own) : prevData.currentRotation.own;
            const newRivalRotation = rivalSideout ? getNextRotation(prevData.currentRotation.rival) : prevData.currentRotation.rival;

            return {
                ...prevData,
                currentSetPointsLog: [...prevData.currentSetPointsLog, {
                    type,
                    category,
                    ownRotation: prevData.currentRotation.own,
                    rivalRotation: prevData.currentRotation.rival
                }],
                currentRotation: {
                    own: newOwnRotation,
                    rival: newRivalRotation
                }
            };
        });
    }, [matchData.isMatchOver, servingTeam]);

    const handleUndo = useCallback(() => {
        if (matchData.isMatchOver) return;
        setMatchData((prevData) => {
            if (prevData.currentSetPointsLog.length === 0) return prevData;

            const lastLog = prevData.currentSetPointsLog[prevData.currentSetPointsLog.length - 1];
            return {
                ...prevData,
                currentSetPointsLog: prevData.currentSetPointsLog.slice(0, -1),
                currentRotation: {
                    own: lastLog.ownRotation,
                    rival: lastLog.rivalRotation
                }
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
                currentRotation: prevData.startingRotations[prevData.currentSet] || { own: 1, rival: 1 }
            };
        });
    }, [canEndSet, currentSetScore, currentSetPointCounts, toast, matchData.teamNames, t]);



    // Dialog check effect
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

    const handleStartMatch = useCallback((ownTeamName: string, rivalTeamName: string, teamColors: TeamColors, location: string, date: string, time: string, startingRotation: { own: number; rival: number }) => {
        const newMatch = getInitialMatchData(ownTeamName, rivalTeamName, teamColors, location, date, time);
        newMatch.startingRotations[0] = startingRotation;
        newMatch.currentRotation = startingRotation;
        setMatchData(newMatch);
        setViewState('serving');
        setIsMatchSaved(false);
        saveMatchData(newMatch.matchId, newMatch);
        localStorage.setItem('lastActiveMatchId', newMatch.matchId);
    }, []);

    const handleSelectFirstServe = useCallback((servingTeam: 'own' | 'rival') => {
        setMatchData(prevData => {
            const newFirstServeBy = [...prevData.firstServeBy];
            newFirstServeBy[prevData.currentSet - 1] = servingTeam;
            return {
                ...prevData,
                firstServeBy: newFirstServeBy,
                currentRotation: prevData.startingRotations[prevData.currentSet - 1] || { own: 1, rival: 1 }
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
        localStorage.removeItem('lastActiveMatchId');
        toast({ title: t('matchSaved'), description: t('matchSavedToHistory') });
        setIsMatchSaved(true);
    }, [matchData, t, toast]);

    const handleStartNewMatch = useCallback(() => {
        localStorage.removeItem('lastActiveMatchId');
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

    const handleRotationChange = useCallback((team: 'own' | 'rival', newRotation: number) => {
        setMatchData(prev => ({
            ...prev,
            currentRotation: {
                ...prev.currentRotation,
                [team]: newRotation
            }
        }));
    }, []);

    return {
        matchData,
        viewState,
        setViewState,
        isMounted: true, // Always true in SPA
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
