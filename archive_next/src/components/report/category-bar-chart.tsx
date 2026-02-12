"use client";

import { useMemo } from 'react';
import type { PointLog, PointType, PointCategory, TeamColors } from "@/lib/types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '../ui/chart';
import { getContrastColor, lightenHslColor } from '@/lib/utils';

interface CategoryBarChartProps {
    pointLog: PointLog[];
    teamColors: TeamColors;
    teamNames: { own: string, rival: string };
    pointTypeLabels: Record<PointType, string>;
    pointCategoryLabels: Record<PointCategory, string>;
}

export const CategoryBarChart = ({
    pointLog,
    teamColors,
    teamNames,
    pointTypeLabels,
    pointCategoryLabels
}: CategoryBarChartProps) => {
    const dataByCategory = useMemo(() => {
        const categoryCounts: Record<string, { ownActions: number; ownPoints: number; ownErrors: number; rivalActions: number; rivalPoints: number; rivalErrors: number; }> = {};

        pointLog.forEach(log => {
            if (!categoryCounts[log.category]) {
                categoryCounts[log.category] = { ownActions: 0, ownPoints: 0, ownErrors: 0, rivalActions: 0, rivalPoints: 0, rivalErrors: 0 };
            }
            if (log.type === 'PPM') {
                categoryCounts[log.category].ownActions++;
                categoryCounts[log.category].ownPoints++;
            }
            else if (log.type === 'PPE') {
                categoryCounts[log.category].ownActions++;
                categoryCounts[log.category].ownErrors++;
            }
            else if (log.type === 'PRM') {
                categoryCounts[log.category].rivalActions++;
                categoryCounts[log.category].rivalPoints++;
            }
            else if (log.type === 'PRE') {
                categoryCounts[log.category].rivalActions++;
                categoryCounts[log.category].rivalErrors++;
            }
        });

        const orderedCategories = ['SAQUE', 'ATAQUE', 'BLOQUEO', 'RECEPCION', 'DEFENSA', 'OTRO'];
        return orderedCategories
            .filter(cat => categoryCounts[cat] && (categoryCounts[cat].ownActions > 0 || categoryCounts[cat].rivalActions > 0))
            .map(cat => {
                const counts = categoryCounts[cat];
                return {
                    category: cat,
                    data: [
                        {
                            team: teamNames.own,
                            PPM: counts.ownPoints,
                            PPE: counts.ownErrors,
                        },
                        {
                            team: teamNames.rival,
                            PRM: counts.rivalPoints,
                            PRE: counts.rivalErrors,
                        }
                    ]
                }
            });
    }, [pointLog, teamNames]);

    const chartConfig = {
        PPM: { label: pointTypeLabels.PPM, color: `hsl(${teamColors.own})` },
        PPE: { label: pointTypeLabels.PPE, color: `hsl(${lightenHslColor(teamColors.own, 20)})` },
        PRM: { label: pointTypeLabels.PRM, color: `hsl(${teamColors.rival})` },
        PRE: { label: pointTypeLabels.PRE, color: `hsl(${lightenHslColor(teamColors.rival, 20)})` },
    };

    const valueFormatter = (value: number) => (value > 0 ? value.toString() : '');

    return (
        <div className='space-y-4'>
            {dataByCategory.map(({ category, data }) => (
                <div key={category} className="space-y-1">
                    <h4 className="font-semibold text-center text-xs text-muted-foreground">{pointCategoryLabels[category as PointCategory]}</h4>
                    <ChartContainer config={chartConfig} className="h-24 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }} barGap={4} barSize={20}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis dataKey="team" type="category" width={0} tick={false} />
                                <ChartTooltipContent />
                                <Bar dataKey="PPM" stackId="a" name={pointTypeLabels.PPM} fill="var(--color-PPM)">
                                    <LabelList dataKey="PPM" position="center" fontSize={10} formatter={valueFormatter} style={{ fill: getContrastColor(teamColors.own) }} className="font-semibold" />
                                </Bar>
                                <Bar dataKey="PPE" stackId="a" name={pointTypeLabels.PPE} fill="var(--color-PPE)" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="PPE" position="center" fontSize={10} formatter={valueFormatter} style={{ fill: getContrastColor(lightenHslColor(teamColors.own, 20)) }} className="font-semibold" />
                                </Bar>
                                <Bar dataKey="PRM" stackId="b" name={pointTypeLabels.PRM} fill="var(--color-PRM)">
                                    <LabelList dataKey="PRM" position="center" fontSize={10} formatter={valueFormatter} style={{ fill: getContrastColor(teamColors.rival) }} className="font-semibold" />
                                </Bar>
                                <Bar dataKey="PRE" stackId="b" name={pointTypeLabels.PRE} fill="var(--color-PRE)" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="PRE" position="center" fontSize={10} formatter={valueFormatter} style={{ fill: getContrastColor(lightenHslColor(teamColors.rival, 20)) }} className="font-semibold" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            ))}
        </div>
    );
};
