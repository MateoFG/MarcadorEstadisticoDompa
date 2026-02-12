"use client";

import type { PointCounts, PointType, TeamColors } from "@/lib/types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '../ui/chart';
import { getContrastColor, lightenHslColor } from '@/lib/utils';

interface TotalPointsBarChartProps {
    pointCounts: PointCounts;
    teamNames: { own: string, rival: string };
    teamColors: { own: string, rival: string };
    pointTypeLabels: Record<PointType, string>;
}

export const TotalPointsBarChart = ({
    pointCounts,
    teamNames,
    teamColors,
    pointTypeLabels
}: TotalPointsBarChartProps) => {

    const data = [
        {
            name: teamNames.own,
            PPM: pointCounts.PPM,
            PRE: pointCounts.PRE,
            total: pointCounts.PPM + pointCounts.PRE
        },
        {
            name: teamNames.rival,
            PRM: pointCounts.PRM,
            PPE: pointCounts.PPE,
            total: pointCounts.PRM + pointCounts.PPE
        },
    ];

    const chartConfig = {
        PPM: { label: pointTypeLabels.PPM, color: `hsl(${teamColors.own})` },
        PRE: { label: pointTypeLabels.PRE, color: `hsl(${lightenHslColor(teamColors.rival, 20)})` },
        PRM: { label: pointTypeLabels.PRM, color: `hsl(${teamColors.rival})` },
        PPE: { label: pointTypeLabels.PPE, color: `hsl(${lightenHslColor(teamColors.own, 20)})` },
    };

    const valueFormatter = (value: number) => (value > 0 ? value.toString() : '');

    return (
        <ChartContainer config={chartConfig} className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={false} />
                    <YAxis type="number" allowDecimals={false} />
                    <ChartTooltipContent />
                    <Bar dataKey="PPM" stackId="points" fill="var(--color-PPM)">
                        <LabelList dataKey="PPM" position="center" fontSize={12} formatter={valueFormatter} style={{ fill: getContrastColor(teamColors.own) }} className="font-semibold" />
                    </Bar>
                    <Bar dataKey="PRE" stackId="points" fill="var(--color-PRE)">
                        <LabelList dataKey="PRE" position="center" fontSize={12} formatter={valueFormatter} style={{ fill: getContrastColor(lightenHslColor(teamColors.rival, 20)) }} className="font-semibold" />
                    </Bar>
                    <Bar dataKey="PRM" stackId="points" fill="var(--color-PRM)">
                        <LabelList dataKey="PRM" position="center" fontSize={12} formatter={valueFormatter} style={{ fill: getContrastColor(teamColors.rival) }} className="font-semibold" />
                    </Bar>
                    <Bar dataKey="PPE" stackId="points" fill="var(--color-PPE)" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="PPE" position="center" fontSize={12} formatter={valueFormatter} style={{ fill: getContrastColor(lightenHslColor(teamColors.own, 20)) }} className="font-semibold" />
                        <LabelList dataKey="total" position="top" offset={5} fontSize={12} formatter={valueFormatter} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};
