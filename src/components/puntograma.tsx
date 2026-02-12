


import { useMemo } from 'react';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, ReferenceLine, LabelList } from 'recharts';
import type { PointLog, TeamColors, PointCategory, PointType } from '@/lib/types';
import { ChartContainer } from './ui/chart';
import { useTranslation } from 'react-i18next';
import { useViewMode } from './view-mode-provider';

interface PuntogramaProps {
  pointLog: PointLog[];
  teamColors: TeamColors;
  pointCategoryLabels: Record<PointCategory, string>;
}


const CustomLabel = (props: any) => {
    const { x, y, index, data, teamColors, pointCategoryLabels, pointTypeLabels, viewMode } = props;
    const pointData = data[index];
  
    if (!pointData || index === 0) return null;
  
    const isOwnPoint = pointData.type === 'PPM' || pointData.type === 'PRE';
    const yOffset = isOwnPoint ? -10 : 10;
    const textAnchor = isOwnPoint ? 'end' : 'start';
    
    let labelColor = 'hsl(var(--muted-foreground))';
    let opacity = 1.0;

    if (pointData.type === 'PPM') { // Own point
      labelColor = `hsl(${teamColors.own})`;
    } else if (pointData.type === 'PRE') { // Rival error -> Own point
      labelColor = `hsl(${teamColors.own})`;
      opacity = 0.7;
    } else if (pointData.type === 'PRM') { // Rival point
      labelColor = `hsl(${teamColors.rival})`;
    } else if (pointData.type === 'PPE') { // Own error -> Rival point
      labelColor = `hsl(${teamColors.rival})`;
      opacity = 0.7;
    }
    
    const categoryLabel = pointCategoryLabels[pointData.category as PointCategory] || pointData.category;
    const typeLabel = pointTypeLabels[pointData.type as PointType] || pointData.type;
    
    const scoreText = `[${pointData.ownScore}-${pointData.rivalScore}]`;
    const detailText = `${typeLabel} (${categoryLabel})`;
    
    const isDesktop = viewMode === 'desktop';
    const labelText = `${scoreText} ${detailText}`;

    return (
      <text 
        x={x} 
        y={y + yOffset} 
        fill={labelColor} 
        opacity={opacity}
        transform={`rotate(-90 ${x},${y})`}
        textAnchor={textAnchor}
        fontSize={isDesktop ? 10 : 8} 
        fontWeight="bold"
        className="transition-opacity"
      >
        {labelText}
      </text>
    );
};

export default function Puntograma({ pointLog, teamColors, pointCategoryLabels }: PuntogramaProps) {
  const { t } = useTranslation();
  const { viewMode } = useViewMode();

  const pointTypeLabels: Record<PointType, string> = {
    PPM: t('pointTypes.PPM'), PRE: t('pointTypes.PRE'), PPE: t('pointTypes.PPE'), PRM: t('pointTypes.PRM'),
  };

  const data = useMemo(() => {
    let ownScore = 0;
    let rivalScore = 0;

    const chartData = pointLog.map((log, index) => {
      if (log.type === 'PPM' || log.type === 'PRE') {
        ownScore++;
      } else {
        rivalScore++;
      }
      return {
        pointIndex: index + 1,
        difference: ownScore - rivalScore,
        type: log.type,
        category: log.category,
        ownScore,
        rivalScore,
      };
    });
    
    return [{ pointIndex: 0, difference: 0, type: '', category: '', ownScore: 0, rivalScore: 0 }, ...chartData];
  }, [pointLog]);

  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.difference));
    const dataMin = Math.min(...data.map((i) => i.difference));

    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;

    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();
  
  const chartConfig = {
    own: { color: `hsl(${teamColors.own})` },
    rival: { color: `hsl(${teamColors.rival})` },
  };
  
  const gradientId = `splitColor-${teamColors.own.replace(/\s/g, '-')}`;
  const lineGradientId = `lineGradient-${teamColors.own.replace(/\s/g, '-')}`;

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full min-w-0">
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{
            top: 40,
            right: 5,
            left: 5,
            bottom: 40,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          
          <defs>
             <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              <stop offset={off} stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id={lineGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor="hsl(var(--primary))" />
              <stop offset={off} stopColor="hsl(var(--destructive))" />
            </linearGradient>
          </defs>

          <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeWidth={1} />
          
          <Area 
            type="monotone" 
            dataKey="difference" 
            strokeWidth={2} 
            stroke={`url(#${lineGradientId})`}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          >
             <LabelList 
                dataKey="difference" 
                content={<CustomLabel data={data} teamColors={teamColors} pointCategoryLabels={pointCategoryLabels} pointTypeLabels={pointTypeLabels} viewMode={viewMode} />} 
              />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
