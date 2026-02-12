"use client";

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MatchData, PointLog } from '@/lib/types';
import { ChartContainer, ChartTooltipContent } from './ui/chart';
import { Separator } from './ui/separator';
import { lightenHslColor, getContrastColor } from '@/lib/utils';


interface MatchStatsDashboardProps {
  matchData: MatchData;
  showSetSelector?: boolean;
  initialSet?: string;
}

const processPointLog = (pointLog: PointLog[]) => {
    const ownPoints = { attacks: 0, aces: 0, blocks: 0, opponentErrors: 0, others: 0, total: 0 };
    const rivalPoints = { attacks: 0, aces: 0, blocks: 0, opponentErrors: 0, others: 0, total: 0 };

    pointLog.forEach(log => {
        if (log.type === 'PPM' || log.type === 'PRE') { // Own team scores
            ownPoints.total++;
            if (log.type === 'PPM') {
                if (log.category === 'ATAQUE') ownPoints.attacks++;
                else if (log.category === 'SAQUE') ownPoints.aces++;
                else if (log.category === 'BLOQUEO') ownPoints.blocks++;
                else ownPoints.others++; // PPM OTRO counts as 'others'
            } else { // PRE
                ownPoints.opponentErrors++;
            }
        } else { // Rival team scores
            rivalPoints.total++;
            if (log.type === 'PRM') {
                if (log.category === 'ATAQUE') rivalPoints.attacks++;
                else if (log.category === 'SAQUE') rivalPoints.aces++;
                else if (log.category === 'BLOQUEO') rivalPoints.blocks++;
                else rivalPoints.others++; // PRM OTRO counts as 'others'
            } else { // PPE
                rivalPoints.opponentErrors++;
            }
        }
    });

    return { ownPoints, rivalPoints };
};


const RADIAN = Math.PI / 180;
const customLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, color }: any) => {
    if (percent < 0.07) return null;

    // Adjust radius to bring the label slightly inwards, giving more room
    const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    const textColor = getContrastColor(color.replace(/hsl\(|\)/g, ''));

    const percentageText = `${(percent * 100).toFixed(0)}%`;

    return (
        <text 
          x={x} 
          y={y} 
          fill={textColor} 
          textAnchor="middle" 
          dominantBaseline="central" 
          className="text-[10px] sm:text-xs font-semibold pointer-events-none"
        >
            <tspan x={x} dy="-0.6em">{name}:</tspan>
            <tspan x={x} dy="1.2em">{percentageText}</tspan>
        </text>
    );
};


export default function MatchStatsDashboard({ matchData, showSetSelector = true, initialSet = 'all' }: MatchStatsDashboardProps) {
  const { t } = useTranslation();
  const { matchHistory, currentSetPointsLog, teamNames, currentSet, teamColors } = matchData;
  const [selectedSet, setSelectedSet] = useState<string>(initialSet);

  const CATEGORIES = [
    { key: 'attacks', label: t('pointCategories.ATAQUE') },
    { key: 'aces', label: t('pointCategories.SAQUE') },
    { key: 'blocks', label: t('pointCategories.BLOQUEO') },
    { key: 'opponentErrors', label: t('errors') },
    { key: 'others', label: t('others') }
];

  const sets = useMemo(() => {
    const historySets = matchHistory.map(set => ({
      value: set.setNumber.toString(),
      label: t('set', { setNumber: set.setNumber }),
      pointLog: set.pointLog
    }));
    
    if (currentSetPointsLog.length > 0 && !matchData.isMatchOver) {
      historySets.push({
        value: currentSet.toString(),
        label: t('setInProgress', { setNumber: currentSet }),
        pointLog: currentSetPointsLog
      });
    }

    return historySets;
  }, [matchHistory, currentSetPointsLog, currentSet, matchData.isMatchOver, t]);

  const pointLogForSelectedSet = useMemo(() => {
    if (selectedSet === 'all') {
      return matchHistory.flatMap(s => s.pointLog);
    }
    const set = sets.find(s => s.value === selectedSet);
    return set ? set.pointLog : [];
  }, [selectedSet, sets, matchHistory]);

  const { ownPoints, rivalPoints } = processPointLog(pointLogForSelectedSet);
  
  const ownTeamColors = [
    lightenHslColor(teamColors.own, 0),   // attacks
    lightenHslColor(teamColors.own, -15), // aces
    lightenHslColor(teamColors.own, 15),  // blocks
    lightenHslColor(teamColors.rival, 20, 50),  // opponentErrors (muted rival color)
    lightenHslColor(teamColors.own, 30, 70), // others
  ];
  const rivalTeamColors = [
    lightenHslColor(teamColors.rival, 0),  // attacks
    lightenHslColor(teamColors.rival, -15),// aces
    lightenHslColor(teamColors.rival, 15), // blocks
    lightenHslColor(teamColors.own, 20, 50),   // opponentErrors (muted own color)
    lightenHslColor(teamColors.rival, 30, 70), // others
  ];

  const ownPieData = CATEGORIES.map((cat, i) => ({ name: cat.label, value: ownPoints[cat.key as keyof typeof ownPoints], color: `hsl(${ownTeamColors[i]})` })).filter(d => d.value > 0);
  const rivalPieData = CATEGORIES.map((cat, i) => ({ name: cat.label, value: rivalPoints[cat.key as keyof typeof rivalPoints], color: `hsl(${rivalTeamColors[i]})` })).filter(d => d.value > 0);


  return (
    <Card className="font-sans w-full">
       <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-center text-lg sm:text-xl font-headline">{t('pointAnalysis')}</CardTitle>
            {showSetSelector && (
              <Select value={selectedSet} onValueChange={setSelectedSet}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder={t('selectSet')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('fullMatch')}</SelectItem>
                  {sets.map(set => (
                    <SelectItem key={set.value} value={set.value}>
                      {set.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 items-start gap-4 sm:gap-8 p-4">
        {/* Center Table */}
        <div className='w-full space-y-3 text-sm sm:text-base my-auto'>
            <div className="grid grid-cols-2 items-center gap-2 text-center font-bold text-lg">
                <span style={{color: `hsl(${teamColors.own})`}}>{teamNames.own}</span>
                <span style={{color: `hsl(${teamColors.rival})`}}>{teamNames.rival}</span>
            </div>
            {CATEGORIES.map((cat, index) => (
                <div key={cat.key} className="space-y-2">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                        <span className="font-bold text-lg sm:text-xl text-right tabular-nums">{ownPoints[cat.key as keyof typeof ownPoints]}</span>
                        <div className="flex items-center gap-2 justify-center">
                            <div className="w-3 h-3 rounded-sm" style={{backgroundColor: `hsl(${ownTeamColors[index]})`}}></div>
                            <span className="text-muted-foreground font-semibold text-xs sm:text-sm whitespace-nowrap">{cat.label}</span>
                            <div className="w-3 h-3 rounded-sm" style={{backgroundColor: `hsl(${rivalTeamColors[index]})`}}></div>
                        </div>
                        <span className="font-bold text-lg sm:text-xl text-left tabular-nums">{rivalPoints[cat.key as keyof typeof rivalPoints]}</span>
                    </div>
                    {index < CATEGORIES.length -1 && <Separator />}
                </div>
            ))}
            <Separator />
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center pt-2">
                <p className='font-semibold text-right'>{t('points', {count: ownPoints.total})}</p>
                  <span className="text-muted-foreground font-semibold text-xs sm:text-sm whitespace-nowrap">{t('total').toUpperCase()}</span>
                <p className='font-semibold text-left'>{t('points', {count: rivalPoints.total})}</p>
            </div>
        </div>
        
        {/* Pie Charts */}
        <div className="w-full space-y-4">
          {/* Own Team Pie Chart */}
          <div className="w-full h-48 sm:h-56">
              <ChartContainer config={{}} className="h-full w-full">
                  <ResponsiveContainer>
                      <PieChart>
                          <Tooltip content={<ChartTooltipContent />} />
                          <Pie 
                              data={ownPieData} 
                              dataKey="value" 
                              nameKey="name" 
                              cx="50%" 
                              cy="50%" 
                              outerRadius="100%" 
                              labelLine={false}
                              label={customLabel}
                          >
                              {ownPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} name={entry.name} color={entry.color}/>)}
                          </Pie>
                      </PieChart>
                  </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Rival Team Pie Chart */}
            <div className="w-full h-48 sm:h-56">
                <ChartContainer config={{}} className="h-full w-full">
                  <ResponsiveContainer>
                      <PieChart>
                          <Tooltip content={<ChartTooltipContent />} />
                          <Pie 
                              data={rivalPieData} 
                              dataKey="value" 
                              nameKey="name" 
                              cx="50%" 
                              cy="50%" 
                              outerRadius="100%"
                              labelLine={false}
                              label={customLabel}
                          >
                              {rivalPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} name={entry.name} color={entry.color}/>)}
                          </Pie>
                      </PieChart>
                  </ResponsiveContainer>
              </ChartContainer>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
