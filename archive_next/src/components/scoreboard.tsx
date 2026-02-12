"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MatchData, SetScore } from "@/lib/types";
import { Trophy, Shirt, BarChart2, Volleyball } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import MatchStatsDashboard from './match-stats-dashboard';

interface ScoreboardProps {
  teamNames: { own: string; rival: string };
  currentSet: number;
  currentSetScore: SetScore;
  setsWon: { own: number; rival: number };
  onTeamNameChange: (team: 'own' | 'rival', newName: string) => void;
  isMatchOver: boolean;
  matchData: MatchData;
  servingTeam: 'own' | 'rival' | null;
  currentRotation: number;
  onRotationChange: (rot: number) => void;
}

const TeamScore = ({ name, score, onNameChange, isEditing, icon: Icon, iconColor, hasServe, teamSide }: { name: string, score: number, onNameChange: (newName: string) => void, isEditing: boolean, icon: React.ElementType, iconColor: string, hasServe: boolean, teamSide: 'own' | 'rival' }) => (
  <div className="flex flex-col items-center gap-4 text-center">
    <div className="flex items-center gap-2 justify-center">
      <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5 fill-current", iconColor)} />
      <Input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        className="text-base sm:text-lg font-bold p-1 h-auto text-center border-0 focus-visible:ring-1 focus-visible:ring-primary bg-transparent disabled:bg-transparent disabled:cursor-text w-32 sm:w-auto"
        disabled={isEditing}
      />
    </div>
    <div className={cn(
      "flex items-center justify-center gap-2 sm:gap-4",
      teamSide === 'rival' && 'flex-row-reverse'
    )}>
      {hasServe && (
        <Volleyball className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground animate-pulse" />
      )}
      <span className={cn(
        "text-6xl sm:text-8xl font-bold text-foreground tabular-nums leading-none tracking-tight",
        !hasServe && (teamSide === 'own' ? 'pl-8 sm:pl-12' : 'pr-8 sm:pr-12') // Add padding to keep scores aligned
      )}>
        {score}
      </span>
    </div>
  </div>
);

export default function Scoreboard({
  teamNames,
  currentSet,
  currentSetScore,
  setsWon,
  onTeamNameChange,
  isMatchOver,
  matchData,
  servingTeam,
  currentRotation,
  onRotationChange,
}: ScoreboardProps) {
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-secondary/50 p-2 sm:p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="font-semibold text-xs sm:text-sm">{t('sets')}: {setsWon.own} - {setsWon.rival}</span>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 h-7 px-2">
                <BarChart2 className="w-4 h-4" />
                <span className="text-xs sm:text-sm">{t('statistics')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] sm:h-auto sm:py-8 w-full sm:max-w-6xl sm:mx-auto sm:rounded-t-lg flex flex-col">
              <div className="py-4 overflow-y-auto flex-grow">
                <SheetHeader className="flex-shrink-0 mb-4">
                  <div className="flex justify-between items-center">
                    <SheetTitle>{t('matchStats')}</SheetTitle>
                  </div>
                </SheetHeader>
                <MatchStatsDashboard matchData={matchData} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 font-bold text-xs bg-background/50"
              onClick={() => onRotationChange(currentRotation === 1 ? 6 : currentRotation - 1)}
              title={t('currentRotation')}
            >
              P{currentRotation}
            </Button>
            <Badge variant={isMatchOver ? "destructive" : "secondary"} className="text-xs sm:text-sm">
              {isMatchOver ? t('finished') : t('set', { setNumber: currentSet })}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-4">
          <TeamScore
            name={teamNames.own}
            score={currentSetScore.own}
            onNameChange={(name) => onTeamNameChange('own', name)}
            isEditing={isMatchOver}
            icon={Shirt}
            iconColor="text-accent"
            hasServe={servingTeam === 'own'}
            teamSide="own"
          />
          <span className="text-4xl sm:text-6xl font-light text-muted-foreground self-center mt-8 sm:mt-10">:</span>
          <TeamScore
            name={teamNames.rival}
            score={currentSetScore.rival}
            onNameChange={(name) => onTeamNameChange('rival', name)}
            isEditing={isMatchOver}
            icon={Shirt}
            iconColor="text-destructive"
            hasServe={servingTeam === 'rival'}
            teamSide="rival"
          />
        </div>
      </CardContent>
    </Card>
  );
}
