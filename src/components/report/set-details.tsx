

import { useTranslation } from 'react-i18next';
import { Separator } from '../ui/separator';
import type { MatchData, PointLog, PointType, PointCategory, SetReport, PointCounts, TeamColors, AdvancedSetStats } from "@/lib/types";
import MatchStatsDashboard from '../match-stats-dashboard';
import { TotalPointsBarChart } from './total-points-bar-chart';
import { CategoryBarChart } from './category-bar-chart';
import { StatsGrid } from './stats-grid';
import { PointLogDetails } from './point-log-details';
import { RotationStatsTable } from './rotation-stats-table';

interface SetDetailsProps {
    title: string;
    score: { own: number, rival: number };
    stats: SetReport | (AdvancedSetStats & { setNumber: number, pointCounts: PointCounts, ownEfficiency: number, rivalErrorImpact: number });
    pointLog: PointLog[];
    teamNames: { own: string, rival: string };
    teamColors: TeamColors;
    isTotal?: boolean;
    matchData?: MatchData;
    pointTypeLabels: Record<PointType, string>;
    pointCategoryLabels: Record<PointCategory, string>;
}

export const SetDetails = ({
    title,
    score,
    stats,
    pointLog,
    teamNames,
    teamColors,
    isTotal = false,
    matchData,
    pointTypeLabels,
    pointCategoryLabels
}: SetDetailsProps) => {
    const { t } = useTranslation();

    // Create a synthetic MatchData object for individual sets to pass to the dashboard
    const dashboardMatchData = isTotal ? matchData : {
        ...matchData,
        matchHistory: matchData?.matchHistory.filter(s => s.setNumber === (stats as SetReport).setNumber) || [],
        currentSetPointsLog: [], // Not needed for individual set report
        isMatchOver: true,
    } as MatchData;

    // Aggregate rotation stats if it's the total view
    const ownRotationStats = isTotal && matchData ? matchData.matchHistory.reduce((acc, set) => {
        if (!set.rotationStats) return acc;
        Object.entries(set.rotationStats).forEach(([rot, rotStat]) => {
            const rotNum = parseInt(rot);
            if (!acc[rotNum]) acc[rotNum] = { gp: 0, sideouts: 0, sideoutChances: 0 };
            acc[rotNum].gp += rotStat.gp;
            acc[rotNum].sideouts += rotStat.sideouts;
            acc[rotNum].sideoutChances += rotStat.sideoutChances;
        });
        return acc;
    }, {} as Record<number, { gp: number; sideouts: number; sideoutChances: number; }>) : (stats as SetReport).rotationStats;

    const rivalRotationStats = isTotal && matchData ? matchData.matchHistory.reduce((acc, set) => {
        if (!set.rivalRotationStats) return acc;
        Object.entries(set.rivalRotationStats).forEach(([rot, rotStat]) => {
            const rotNum = parseInt(rot);
            if (!acc[rotNum]) acc[rotNum] = { gp: 0, sideouts: 0, sideoutChances: 0 };
            acc[rotNum].gp += rotStat.gp;
            acc[rotNum].sideouts += rotStat.sideouts;
            acc[rotNum].sideoutChances += rotStat.sideoutChances;
        });
        return acc;
    }, {} as Record<number, { gp: number; sideouts: number; sideoutChances: number; }>) : (stats as SetReport).rivalRotationStats;


    return (
        <div className="border-b last:border-b-0 py-4">
            <div className="flex flex-col items-center w-full font-bold text-lg sm:text-xl text-center mb-4 px-4">
                <span className="mb-1">{title}</span>
                <div className="flex gap-4 text-base sm:text-lg">
                    <span style={{ color: `hsl(${teamColors.own})` }}>
                        {teamNames.own}: {score.own}
                    </span>
                    <span style={{ color: `hsl(${teamColors.rival})` }}>
                        {teamNames.rival}: {score.rival}
                    </span>
                </div>
            </div>

            <div className="space-y-4 p-4 pt-0 rounded-b-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4 space-y-2">
                        <h4 className="font-semibold text-center text-sm text-muted-foreground">{t('totalPoints')}</h4>
                        <TotalPointsBarChart pointCounts={stats.pointCounts} teamNames={teamNames} teamColors={teamColors} pointTypeLabels={pointTypeLabels} />
                    </div>
                    <div className="border rounded-lg p-4 space-y-2">
                        <h4 className="font-semibold text-center text-sm text-muted-foreground">{t('pointsByPlay')}</h4>
                        <CategoryBarChart pointLog={pointLog} teamColors={teamColors} teamNames={teamNames} pointTypeLabels={pointTypeLabels} pointCategoryLabels={pointCategoryLabels} />
                    </div>
                </div>

                <div className="text-sm sm:text-base space-y-2 mt-4">
                    <div className='border rounded-lg p-4 space-y-2'>
                        <div className="grid grid-cols-2 gap-4 font-semibold border-b pb-2 text-center">
                            <div style={{ color: `hsl(${teamColors.own})` }}>{teamNames.own}</div>
                            <div style={{ color: `hsl(${teamColors.rival})` }}>{teamNames.rival}</div>
                        </div>
                        {stats.sideoutPercentage && (
                            <>
                                <StatsGrid label={t('sideoutPercentage')} ownValue={`${(stats.sideoutPercentage.own * 100).toFixed(1)}%`} rivalValue={`${(stats.sideoutPercentage.rival * 100).toFixed(1)}%`} />
                                <StatsGrid label={t('breakPoints')} ownValue={stats.breakPoints.own.toString()} rivalValue={stats.breakPoints.rival.toString()} />
                                <Separator className="my-2" />
                                <StatsGrid label={t('gp')} ownValue={`${stats.pointCounts.PPM - stats.pointCounts.PPE}`} rivalValue={`${stats.pointCounts.PRM - stats.pointCounts.PRE}`} />
                                <Separator className="my-2" />
                                <StatsGrid label={t('efficiency')} ownValue={`${(stats.ownEfficiency).toFixed(2)}`} rivalValue={`${(1 - stats.rivalErrorImpact).toFixed(2)}`} />
                            </>
                        )}
                    </div>

                    <div className='border rounded-lg p-4 space-y-2'>
                        <h4 className="font-semibold text-center text-sm text-muted-foreground mb-2">{t('rotationStats')}</h4>
                        <RotationStatsTable rotationStats={ownRotationStats || {}} rivalRotationStats={rivalRotationStats || {}} />
                    </div>
                </div>

                {!isTotal && (
                    <div className="pt-4 border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-base sm:text-lg">{t('pointLog')}:</h4>
                        <PointLogDetails pointLog={pointLog} teamNames={teamNames} teamColors={teamColors} pointTypeLabels={pointTypeLabels} pointCategoryLabels={pointCategoryLabels} />
                    </div>
                )}

                {/* Render Point Analysis Dashboard */}
                <div className="pt-4 grid grid-cols-1">
                    {isTotal && matchData && (
                        <MatchStatsDashboard
                            matchData={matchData}
                            showSetSelector={false}
                            initialSet="all"
                        />
                    )}
                    {!isTotal && dashboardMatchData && (
                        <MatchStatsDashboard
                            matchData={dashboardMatchData}
                            showSetSelector={false}
                            initialSet={stats.setNumber.toString()}
                        />
                    )}
                </div>

            </div>
        </div>
    );
};
