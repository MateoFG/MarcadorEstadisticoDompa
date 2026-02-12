"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shirt, Info, Play, Calendar, Clock, MapPin, History } from 'lucide-react';
import { SET_POINTS_REGULAR, SET_POINTS_DECIDER, REQUIRED_POINT_DIFFERENCE, SETS_TO_WIN_MATCH } from '@/lib/constants';
import { TeamColors } from '@/lib/types';
import { Separator } from './ui/separator';
import { hexToHsl, hslToHex } from '@/lib/utils';

interface StartScreenProps {
  onStartMatch: (ownTeamName: string, rivalTeamName: string, teamColors: TeamColors, location: string, date: string, time: string, startingRotation: number) => void;
  onTeamNameChange: (team: 'own' | 'rival', newName: string) => void;
  onTeamColorChange: (team: 'own' | 'rival', newColor: string) => void;
  teamNames: { own: string; rival: string };
  teamColors: { own: string; rival: string };
  onViewHistory: () => void;
}


export default function StartScreen({ onStartMatch, onTeamNameChange, onTeamColorChange, teamNames, teamColors, onViewHistory }: StartScreenProps) {
  const { t } = useTranslation();
  const [ownName, setOwnName] = useState(teamNames.own);
  const [rivalName, setRivalName] = useState(teamNames.rival);
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [startingRotation, setStartingRotation] = useState(1);

  const handleStart = () => {
    onStartMatch(ownName.trim() || t('homeTeam'), rivalName.trim() || t('rivalTeam'), teamColors, location, date, time, startingRotation);
  };

  const handleColorChange = (team: 'own' | 'rival', hexColor: string) => {
    const hslColor = hexToHsl(hexColor);
    onTeamColorChange(team, hslColor);
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-headline text-center">{t('setupNewMatch')}</CardTitle>
          <CardDescription className="text-center text-foreground/60 text-sm sm:text-base">{t('setupNewMatchDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="space-y-2">
            <Label htmlFor="own-team" className="flex items-center gap-2 text-sm sm:text-base">
              <Shirt className="w-4 h-4 text-accent fill-current" />
              {t('yourTeam')}
            </Label>
            <div className="flex gap-2">
              <Input
                id="own-team"
                placeholder={t('yourTeamName')}
                value={ownName}
                onChange={(e) => setOwnName(e.target.value)}
                className="text-base sm:text-lg flex-1"
              />
              <Input
                id="own-team-color"
                type="color"
                value={hslToHex(teamColors.own)}
                onChange={(e) => handleColorChange('own', e.target.value)}
                className="w-12 h-10 p-1"
                title={t('ownTeamColor')}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rival-team" className="flex items-center gap-2 text-sm sm:text-base">
              <Shirt className="w-4 h-4 text-destructive fill-current" />
              {t('rivalTeam')}
            </Label>
            <div className="flex gap-2">
              <Input
                id="rival-team"
                placeholder={t('rivalTeamName')}
                value={rivalName}
                onChange={(e) => setRivalName(e.target.value)}
                className="text-base sm:text-lg flex-1"
              />
              <Input
                id="rival-team-color"
                type="color"
                value={hslToHex(teamColors.rival)}
                onChange={(e) => handleColorChange('rival', e.target.value)}
                className="w-12 h-10 p-1"
                title={t('rivalTeamColor')}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2 text-sm sm:text-base">
              <MapPin className="w-4 h-4" />
              {t('matchLocation')}
            </Label>
            <Input
              id="location"
              placeholder={t('locationPlaceholder')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="text-base sm:text-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2 text-sm sm:text-base">
                <Calendar className="w-4 h-4" />
                {t('date')}
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-sm sm:text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2 text-sm sm:text-base">
                <Clock className="w-4 h-4" />
                {t('time')}
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-sm sm:text-lg"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm sm:text-base">
              <History className="w-4 h-4" />
              {t('startingRotation')}
            </Label>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((rot) => (
                <Button
                  key={rot}
                  type="button"
                  variant={startingRotation === rot ? "default" : "outline"}
                  className="h-10 text-xs sm:text-sm font-bold"
                  onClick={() => setStartingRotation(rot)}
                >
                  P{rot}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 p-4 sm:p-6">
          <Button onClick={handleStart} className="w-full text-base sm:text-lg h-11 sm:h-12 gap-2">
            <Play className="w-5 h-5" />
            {t('startMatch')}
          </Button>
          <div className="flex items-center w-full gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">{t('or')}</span>
            <Separator className="flex-1" />
          </div>
          <Button onClick={onViewHistory} variant="outline" className="w-full text-base sm:text-lg h-11 sm:h-12 gap-2">
            <History className="w-5 h-5" />
            {t('matchHistory')}
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full max-w-md mx-auto bg-secondary/50" variant="outline">
        <CardHeader className="p-4">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            {t('gameRules')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs sm:text-sm text-muted-foreground space-y-1 px-4 pb-4">
          <p>• {t('rules.bestOf', { count: SETS_TO_WIN_MATCH * 2 - 1, sets: SETS_TO_WIN_MATCH })}</p>
          <p>• {t('rules.setsTo', { count: SET_POINTS_REGULAR })}</p>
          <p>• {t('rules.deciderSetTo', { count: SET_POINTS_DECIDER })}</p>
          <p>• {t('rules.winBy', { count: REQUIRED_POINT_DIFFERENCE })}</p>
        </CardContent>
      </Card>
    </div>
  );
}
