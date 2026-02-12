import type { PointCounts, SetScore, PointLog, SetReport } from './types';

export const calculateSetReport = (setNumber: number, pointCounts: PointCounts, finalScore: SetScore, pointLog: PointLog[], firstServer: 'own' | 'rival' | null): SetReport => {

    // --- Cálculo de Eficiencia ---
    const ownActions = pointCounts.PPM + pointCounts.PPE;
    const ownEfficiency = ownActions > 0 ? (pointCounts.PPM - pointCounts.PPE) / ownActions : 0;

    const rivalActions = pointCounts.PRM + pointCounts.PRE;
    const rivalEfficiency = rivalActions > 0 ? (pointCounts.PRM - pointCounts.PRE) / rivalActions : 0;


    // --- Cálculo de Estadísticas Avanzadas (Sideout, Break Points, etc.) ---
    let ownSideoutChances = 0, ownSideouts = 0, rivalSideoutChances = 0, rivalSideouts = 0;
    let ownBreakPoints = 0, rivalBreakPoints = 0;

    // Rotation stats
    const rotationStats: Record<number, { gp: number; sideouts: number; sideoutChances: number; }> = {
        1: { gp: 0, sideouts: 0, sideoutChances: 0 },
        2: { gp: 0, sideouts: 0, sideoutChances: 0 },
        3: { gp: 0, sideouts: 0, sideoutChances: 0 },
        4: { gp: 0, sideouts: 0, sideoutChances: 0 },
        5: { gp: 0, sideouts: 0, sideoutChances: 0 },
        6: { gp: 0, sideouts: 0, sideoutChances: 0 },
    };

    let currentServer = firstServer;

    pointLog.forEach(point => {
        const pointWinner = (point.type === 'PPM' || point.type === 'PRE') ? 'own' : 'rival';
        const rot = point.rotation || 1; // Fallback to 1 for safety

        // Update G-P for the rotation
        rotationStats[rot].gp += (pointWinner === 'own' ? 1 : -1);

        if (currentServer === 'own') {
            rivalSideoutChances++;
            if (pointWinner === 'own') {
                ownBreakPoints++;
            } else {
                rivalSideouts++;
                currentServer = 'rival';
            }
        } else if (currentServer === 'rival') {
            ownSideoutChances++;
            rotationStats[rot].sideoutChances++; // Chance for sideout in this rotation

            if (pointWinner === 'rival') {
                rivalBreakPoints++;
            } else {
                ownSideouts++;
                rotationStats[rot].sideouts++; // Success sideout in this rotation
                currentServer = 'own';
            }
        }
    });

    // --- Cálculo de Puntos por Saque ---
    const ownServeRotations = pointLog.filter((p, i) => {
        if (i === 0) return firstServer === 'own';
        const prevPointWinner = (pointLog[i - 1].type === 'PPM' || pointLog[i - 1].type === 'PRE') ? 'own' : 'rival';
        return prevPointWinner === 'rival';
    }).length;

    const rivalServeRotations = pointLog.filter((p, i) => {
        if (i === 0) return firstServer === 'rival';
        const prevPointWinner = (pointLog[i - 1].type === 'PPM' || pointLog[i - 1].type === 'PRE') ? 'own' : 'rival';
        return prevPointWinner === 'own';
    }).length;

    const ownPoints = pointCounts.PPM + pointCounts.PRE;
    const rivalPoints = pointCounts.PPE + pointCounts.PRM;

    return {
        setNumber,
        finalScore,
        pointCounts,
        ownEfficiency: ownEfficiency,
        rivalErrorImpact: 1 - rivalEfficiency,
        pointLog,
        rotationStats,
        sideoutPercentage: {
            own: ownSideoutChances > 0 ? ownSideouts / ownSideoutChances : 0,
            rival: rivalSideoutChances > 0 ? rivalSideouts / rivalSideoutChances : 0,
        },
        pointsPerServe: {
            own: ownServeRotations > 0 ? ownPoints / ownServeRotations : 0,
            rival: rivalServeRotations > 0 ? rivalPoints / rivalServeRotations : 0,
        },
        breakPoints: {
            own: ownBreakPoints,
            rival: rivalBreakPoints,
        }
    };
};
