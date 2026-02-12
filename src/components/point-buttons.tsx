

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { PointType, PointCategory, TeamColors } from "@/lib/types";
import { Undo2, FlagOff, RefreshCcw } from 'lucide-react';
import { getContrastColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface PointButtonsProps {
  onAddPoint: (type: PointType, category: PointCategory) => void;
  onUndo: () => void;
  onEndMatch: () => void;
  onResetSet: () => void;
  canUndo: boolean;
  canResetSet: boolean;
  teamColors: TeamColors;
  servingTeam: 'own' | 'rival' | null;
}

const ButtonGroup = ({ title, type, categories, onAddPoint, baseColor, textColor, borderColor, isMuted = false, disabledCategories = [] }: { title: string, type: PointType, categories: { name: PointCategory, label: string }[], onAddPoint: (type: PointType, category: PointCategory) => void, baseColor: string, textColor: string, borderColor: string, isMuted?: boolean, disabledCategories?: PointCategory[] }) => {

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-center text-xs sm:text-sm">{title}</h4>
      <div className={`grid grid-cols-2 lg:grid-cols-2 gap-2`}>
        {categories.map((category) => {
           const isDisabled = disabledCategories.includes(category.name);
           const style = isDisabled
            ? {
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))',
                borderBottom: `3px solid hsl(var(--border))`,
              }
            : {
                backgroundColor: baseColor,
                color: textColor,
                borderBottom: `3px solid ${borderColor}`,
                opacity: isMuted ? 0.7 : 1,
              };

           return (
            <Button 
                key={category.name} 
                onClick={() => onAddPoint(type, category.name)} 
                disabled={isDisabled}
                className={cn(
                  "text-xs h-9 transition-transform duration-100 active:translate-y-px",
                )}
                style={style}
              >
              {category.label}
            </Button>
           )
        })}
      </div>
    </div>
  )
};


export default function PointButtons({
  onAddPoint,
  onUndo,
  onEndMatch,
  onResetSet,
  canUndo,
  canResetSet,
  teamColors,
  servingTeam,
}: PointButtonsProps) {
  const { t } = useTranslation();
  const ownTeamTextColor = getContrastColor(teamColors.own);
  const rivalTeamTextColor = getContrastColor(teamColors.rival);

  const pointCategoriesForPoints: { name: PointCategory, label: string }[] = [
    { name: 'ATAQUE', label: t('pointCategories.ATAQUE') },
    { name: 'SAQUE', label: t('pointCategories.SAQUE') },
    { name: 'BLOQUEO', label: t('pointCategories.BLOQUEO') },
    { name: 'OTRO', label: t('pointCategories.OTRO') },
  ];
  
  const pointCategoriesForErrors: { name: PointCategory, label: string }[] = [
    { name: 'ATAQUE', label: t('pointCategories.ATAQUE') },
    { name: 'SAQUE', label: t('pointCategories.SAQUE') },
    { name: 'RECEPCION', label: t('pointCategories.RECEPCION') },
    { name: 'DEFENSA', label: t('pointCategories.DEFENSA') },
    { name: 'OTRO', label: t('pointCategories.OTRO') },
  ];

  let ownPointDisabled: PointCategory[] = [];
  let rivalErrorDisabled: PointCategory[] = [];
  let rivalPointDisabled: PointCategory[] = [];
  let ownErrorDisabled: PointCategory[] = [];

  if (servingTeam === 'own') {
    rivalPointDisabled = ['SAQUE'];
    rivalErrorDisabled = ['SAQUE'];
    ownErrorDisabled = ['RECEPCION'];
  } else if (servingTeam === 'rival') {
    ownPointDisabled = ['SAQUE'];
    ownErrorDisabled = ['SAQUE'];
    rivalErrorDisabled = ['RECEPCION'];
  }


  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-3 p-3">
        <div className="bg-card p-3 space-y-3 rounded-l-md border-r">
          <ButtonGroup title={t('pointTypes.PPM')} type="PPM" categories={pointCategoriesForPoints} onAddPoint={onAddPoint} baseColor="hsl(var(--accent-hsl))" textColor={ownTeamTextColor} borderColor="hsl(var(--accent-hsl), 0.8)" disabledCategories={ownPointDisabled} />
          <ButtonGroup title={t('pointTypes.PRE')} type="PRE" categories={pointCategoriesForErrors} onAddPoint={onAddPoint} baseColor="hsl(var(--destructive-hsl))" textColor={rivalTeamTextColor} borderColor="hsl(var(--destructive-hsl), 0.8)" isMuted={true} disabledCategories={rivalErrorDisabled} />
        </div>
         <div className="bg-card p-3 space-y-3 rounded-r-md">
          <ButtonGroup title={t('pointTypes.PRM')} type="PRM" categories={pointCategoriesForPoints} onAddPoint={onAddPoint} baseColor="hsl(var(--destructive-hsl))" textColor={rivalTeamTextColor} borderColor="hsl(var(--destructive-hsl), 0.8)" disabledCategories={rivalPointDisabled}/>
          <ButtonGroup title={t('pointTypes.PPE')} type="PPE" categories={pointCategoriesForErrors} onAddPoint={onAddPoint} baseColor="hsl(var(--accent-hsl))" textColor={ownTeamTextColor} borderColor="hsl(var(--accent-hsl), 0.8)" isMuted={true} disabledCategories={ownErrorDisabled} />
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-3 gap-2 pt-3 p-3">
        <Button onClick={onUndo} disabled={!canUndo} variant="outline" className="gap-1 h-9 text-xs sm:h-10 sm:text-sm">
          <Undo2 className="h-4 w-4" /> {t('undo')}
        </Button>
        <Button onClick={onResetSet} disabled={!canResetSet} variant="outline" className="gap-1 h-9 text-xs sm:h-10 sm:text-sm">
          <RefreshCcw className="h-4 w-4" /> {t('resetSet')}
        </Button>
        <Button onClick={onEndMatch} variant="outline" className="gap-1 h-9 text-xs sm:h-10 sm:text-sm">
          <FlagOff className="h-4 w-4" /> {t('end')}
        </Button>
      </CardFooter>
    </Card>
  );
}
