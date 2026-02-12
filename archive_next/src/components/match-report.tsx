"use client";

import { useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusCircle, Trophy, Download, Save, CheckCircle } from "lucide-react";
import type { MatchData, PointType, PointCategory, PointCounts } from "@/lib/types";
import { Separator } from './ui/separator';
import { useViewMode } from '@/components/view-mode-provider';
import Puntograma from './puntograma';
import { SetDetails } from './report/set-details';

interface MatchReportProps {
  matchData: MatchData;
  isMatchSaved: boolean;
  onSaveMatch: () => void;
  onStartNewMatch: () => void;
}

export default function MatchReport({ matchData, isMatchSaved, onSaveMatch, onStartNewMatch }: MatchReportProps) {
  const { t } = useTranslation();
  const reportRef = useRef<HTMLDivElement>(null);
  const winner = matchData.setsWon.own > matchData.setsWon.rival ? matchData.teamNames.own : matchData.teamNames.rival;
  const { viewMode } = useViewMode();

  const partialScores = useMemo(() => {
    return matchData.matchHistory.map(set => `${set.finalScore.own}-${set.finalScore.rival}`).join(', ');
  }, [matchData.matchHistory]);

  const totalMatchStats = useMemo(() => {
    const totalPointCounts: PointCounts = { PPM: 0, PRE: 0, PPE: 0, PRM: 0 };
    let totalOwnSideoutChances = 0, totalOwnSideouts = 0, totalRivalSideoutChances = 0, totalRivalSideouts = 0;
    let totalOwnBreakPoints = 0, totalRivalBreakPoints = 0;
    let totalOwnServePoints = 0, totalRivalServePoints = 0;
    let totalOwnServeRotations = 0, totalRivalServeRotations = 0;


    matchData.matchHistory.forEach(set => {
      totalPointCounts.PPM += set.pointCounts.PPM;
      totalPointCounts.PRE += set.pointCounts.PRE;
      totalPointCounts.PPE += set.pointCounts.PPE;
      totalPointCounts.PRM += set.pointCounts.PRM;

      if (set.breakPoints) {
        totalOwnBreakPoints += set.breakPoints.own;
        totalRivalBreakPoints += set.breakPoints.rival;
      }

      const ownServeOpportunities = set.pointLog.filter(p => (p.type === 'PPE' || p.type === 'PRM')).length;
      const rivalServeOpportunities = set.pointLog.filter(p => (p.type === 'PPM' || p.type === 'PRE')).length;

      if (set.sideoutPercentage) {
        totalOwnSideouts += set.sideoutPercentage.own * rivalServeOpportunities;
        totalOwnSideoutChances += rivalServeOpportunities;

        totalRivalSideouts += set.sideoutPercentage.rival * ownServeOpportunities;
        totalRivalSideoutChances += ownServeOpportunities;
      }

      if (set.pointsPerServe) {
        if (set.pointsPerServe.own > 0) {
          const setOwnPoints = set.pointCounts.PPM + set.pointCounts.PRE;
          totalOwnServePoints += setOwnPoints;
          const rotations = set.pointLog.filter((p, i) => {
            if (i === 0) return matchData.firstServeBy[set.setNumber - 1] === 'own';
            const prevPointWinner = (set.pointLog[i - 1].type === 'PPM' || set.pointLog[i - 1].type === 'PRE') ? 'own' : 'rival';
            return prevPointWinner === 'rival';
          }).length;
          totalOwnServeRotations += rotations > 0 ? rotations : (matchData.firstServeBy[set.setNumber - 1] === 'own' ? 1 : 0);
        }
        if (set.pointsPerServe.rival > 0) {
          const setRivalPoints = set.pointCounts.PPE + set.pointCounts.PRM;
          totalRivalServePoints += setRivalPoints;
          const rotations = set.pointLog.filter((p, i) => {
            if (i === 0) return matchData.firstServeBy[set.setNumber - 1] === 'rival';
            const prevPointWinner = (set.pointLog[i - 1].type === 'PPM' || set.pointLog[i - 1].type === 'PRE') ? 'own' : 'rival';
            return prevPointWinner === 'own';
          }).length;
          totalRivalServeRotations += rotations > 0 ? rotations : (matchData.firstServeBy[set.setNumber - 1] === 'rival' ? 1 : 0);
        }
      }
    });

    const totalOwnPointsActions = totalPointCounts.PPM + totalPointCounts.PPE;
    const totalRivalPointsActions = totalPointCounts.PRM + totalPointCounts.PRE;

    const totalOwnEfficiency = totalOwnPointsActions > 0 ? (totalPointCounts.PPM - totalPointCounts.PPE) / totalOwnPointsActions : 0;
    const totalRivalEfficiency = totalRivalPointsActions > 0 ? (totalPointCounts.PRM - totalPointCounts.PRE) / totalRivalPointsActions : 0;

    return {
      setNumber: 0, // Not applicable for total
      finalScore: { own: matchData.setsWon.own, rival: matchData.setsWon.rival }, // Here it represents sets won
      pointCounts: totalPointCounts,
      ownEfficiency: totalOwnEfficiency,
      rivalErrorImpact: 1 - totalRivalEfficiency, // This seems to be how it's used in the grid
      pointLog: matchData.matchHistory.flatMap(set => set.pointLog || []),
      sideoutPercentage: {
        own: totalOwnSideoutChances > 0 ? totalOwnSideouts / totalOwnSideoutChances : 0,
        rival: totalRivalSideoutChances > 0 ? totalRivalSideouts / totalRivalSideoutChances : 0,
      },
      pointsPerServe: {
        own: totalOwnServeRotations > 0 ? (totalPointCounts.PPM + totalPointCounts.PRE) / totalOwnServeRotations : 0,
        rival: totalRivalServeRotations > 0 ? (totalPointCounts.PPE + totalPointCounts.PRM) / totalRivalServeRotations : 0,
      },
      breakPoints: {
        own: totalOwnBreakPoints,
        rival: totalRivalBreakPoints,
      }
    };
  }, [matchData.matchHistory, matchData.setsWon, matchData.firstServeBy]);

  const handleExportToHtml = () => {
    const container = document.getElementById('export-container');
    if (!container) {
      console.error('Export container not found.');
      return;
    }

    const clone = container.cloneNode(true) as HTMLElement;

    // Remove elements that should not be in the export
    clone.querySelectorAll('.no-export').forEach(el => el.remove());

    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Prevent CORS issues with external stylesheets
          if (sheet.href) {
            return `@import url(${sheet.href});`;
          }
          return '';
        }
      })
      .join('\n');

    // Get the main HTML element classes (for dark/light theme)
    const htmlElementClasses = document.documentElement.className;

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="es" class="${htmlElementClasses}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t('matchReportTitle', { own: matchData.teamNames.own, rival: matchData.teamNames.rival })}</title>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; color-adjust: exact; }
          }
          body {
            background-color: hsl(var(--background));
            font-family: 'Inter', sans-serif;
          }
          ${styles}
        </style>
      </head>
      <body class="p-4 sm:p-8">
        ${clone.outerHTML}
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${matchData.matchId.substring(0, 8)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pointTypeLabels: Record<PointType, string> = {
    PPM: t('pointTypes.PPM'), PRE: t('pointTypes.PRE'), PPE: t('pointTypes.PPE'), PRM: t('pointTypes.PRM'),
  };
  const pointCategoryLabels: Record<PointCategory, string> = {
    SAQUE: t('pointCategories.SAQUE'), ATAQUE: t('pointCategories.ATAQUE'), BLOQUEO: t('pointCategories.BLOQUEO'), RECEPCION: t('pointCategories.RECEPCION'), DEFENSA: t('pointCategories.DEFENSA'), OTRO: t('pointCategories.OTRO'),
  };

  return (
    <Card className="w-full animate-in fade-in-50">
      <div ref={reportRef}>
        <div className="p-2 sm:p-6 bg-card text-card-foreground">
          <CardHeader className="text-center p-0 pb-6">
            <Trophy className="w-12 h-12 mx-auto text-yellow-500" />
            <CardTitle className="text-3xl font-headline">{t('matchFinished')}</CardTitle>
            <CardDescription className="text-sm text-foreground/80">
              {matchData.location && `${matchData.location} - `}
              {matchData.date && `${new Date(matchData.date).toLocaleDateString()} `}
              {matchData.time && `${t('atTime')} ${matchData.time}`}
            </CardDescription>
            <CardDescription className="text-lg text-foreground/80 pt-2">
              {t('matchWinner', { winner })}
            </CardDescription>
            <div className="pt-2">
              <p className="text-2xl font-bold">{`${matchData.setsWon.own} - ${matchData.setsWon.rival}`}</p>
              <p className="text-sm text-muted-foreground">({partialScores})</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-0">
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2 p-4">
                <FileText className="w-5 h-5" />
                {t('setSummary')}
              </h3>
              <div className="w-full space-y-4 border rounded-lg">
                <SetDetails
                  title={t('fullMatch').toUpperCase()}
                  score={totalMatchStats.finalScore}
                  stats={totalMatchStats as any}
                  pointLog={totalMatchStats.pointLog}
                  teamNames={matchData.teamNames}
                  teamColors={matchData.teamColors}
                  isTotal={true}
                  matchData={matchData}
                  pointTypeLabels={pointTypeLabels}
                  pointCategoryLabels={pointCategoryLabels}
                />

                {matchData.matchHistory.map((set, index) => (
                  <SetDetails
                    key={index}
                    title={t('set', { setNumber: set.setNumber })}
                    score={set.finalScore}
                    stats={set}
                    pointLog={set.pointLog}
                    teamNames={matchData.teamNames}
                    teamColors={matchData.teamColors}
                    matchData={matchData}
                    pointTypeLabels={pointTypeLabels}
                    pointCategoryLabels={pointCategoryLabels}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2 p-4">
                <FileText className="w-5 h-5" />
                {t('puntograma')}
              </h3>
              <div className="w-full space-y-4 border rounded-lg p-4">
                {matchData.matchHistory.map((set, index) => (
                  <div key={index}>
                    <h4 className="text-lg font-semibold text-center mb-2">{t('set', { setNumber: set.setNumber })} ({set.finalScore.own} - {set.finalScore.rival})</h4>
                    <Puntograma
                      pointLog={set.pointLog}
                      teamColors={matchData.teamColors}
                      pointCategoryLabels={pointCategoryLabels}
                    />
                    {index < matchData.matchHistory.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </div>
      </div>
      <CardFooter className="flex flex-col sm:flex-row justify-center gap-2 pt-6 no-print">
        {isMatchSaved ? (
          <Button disabled variant="outline" className="w-full sm:w-auto flex-1 gap-2 no-export">
            <CheckCircle className="w-4 h-4" />
            {t('matchSaved')}
          </Button>
        ) : (
          <Button onClick={onSaveMatch} variant="outline" className="w-full sm:w-auto flex-1 gap-2 no-export">
            <Save className="w-4 h-4" />
            {t('saveMatch')}
          </Button>
        )
        }
        <Button onClick={handleExportToHtml} variant="outline" className="w-full sm:w-auto flex-1 gap-2 no-export">
          <Download className="w-4 h-4" />
          {t('exportHTML')}
        </Button>
        <Button onClick={onStartNewMatch} className="w-full sm:w-auto flex-1 gap-2 no-export">
          <PlusCircle className="w-4 h-4" />
          {t('newMatch')}
        </Button>
      </CardFooter>
    </Card>
  );
}
