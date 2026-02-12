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
    const ownRotationStats: Record<number, { gp: number; sideouts: number; sideoutChances: number; }> = {
        1: { gp: 0, sideouts: 0, sideoutChances: 0 },
        2: { gp: 0, sideouts: 0, sideoutChances: 0 },
        3: { gp: 0, sideouts: 0, sideoutChances: 0 },
        4: { gp: 0, sideouts: 0, sideoutChances: 0 },
        5: { gp: 0, sideouts: 0, sideoutChances: 0 },
        6: { gp: 0, sideouts: 0, sideoutChances: 0 },
    };

    const rivalRotationStats: Record<number, { gp: number; sideouts: number; sideoutChances: number; }> = {
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
        const ownRot = point.ownRotation || 1;
        const rivalRot = point.rivalRotation || 1;

        // Update G-P for both
        ownRotationStats[ownRot].gp += (pointWinner === 'own' ? 1 : -1);
        rivalRotationStats[rivalRot].gp += (pointWinner === 'rival' ? 1 : -1);

        if (currentServer === 'own') {
            rivalSideoutChances++;
            rivalRotationStats[rivalRot].sideoutChances++;

            if (pointWinner === 'own') {
                ownBreakPoints++;
            } else {
                rivalSideouts++;
                rivalRotationStats[rivalRot].sideouts++;
                currentServer = 'rival';
            }
        } else if (currentServer === 'rival') {
            ownSideoutChances++;
            ownRotationStats[ownRot].sideoutChances++;

            if (pointWinner === 'rival') {
                rivalBreakPoints++;
            } else {
                ownSideouts++;
                ownRotationStats[ownRot].sideouts++;
                currentServer = 'own';
            }
        }
    });

    // Rename back for return object or just add rivalstats

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
        rotationStats: ownRotationStats,
        rivalRotationStats,
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

export const calculatePointCounts = (pointLog: PointLog[]): PointCounts => {
    return pointLog.reduce(
        (counts, log) => {
            counts[log.type]++;
            return counts;
        },
        { PPM: 0, PRE: 0, PPE: 0, PRM: 0 } as PointCounts
    );
};

export const calculateScore = (counts: PointCounts): SetScore => {
    const own = counts.PPM + counts.PRE;
    const rival = counts.PPE + counts.PRM;
    return { own, rival };
};

export const determineServingTeam = (
    pointLog: PointLog[],
    currentSet: number,
    firstServeBy: ('own' | 'rival' | null)[]
): 'own' | 'rival' | null => {
    if (pointLog.length === 0) {
        return firstServeBy[currentSet - 1] || null;
    }
    const lastPoint = pointLog[pointLog.length - 1];
    return (lastPoint.type === 'PPM' || lastPoint.type === 'PRE') ? 'own' : 'rival';
};
