

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History, ArrowLeft, Trash2 } from 'lucide-react';
import type { MatchData } from '@/lib/types';
import { getCompletedMatches, loadMatchData, deleteCompletedMatch } from '@/lib/dataService';
import { ConfirmationDialog } from './confirmation-dialog';

interface HistoryScreenProps {
  onSelectMatch: (match: MatchData) => void;
  onBack: () => void;
}

export default function HistoryScreen({ onSelectMatch, onBack }: HistoryScreenProps) {
  const { t } = useTranslation();
  const [matches, setMatches] = useState<MatchData[]>(() => getCompletedMatches());
  const [dialogConfig, setDialogConfig] = useState<{ title: string; description: string; onConfirm: () => void } | null>(null);

  // Removiendo useEffect anterior para inicializar directamente en el estado

  const handleSelect = (matchId: string) => {
    const match = loadMatchData(matchId);
    if (match) {
      onSelectMatch(match)
    }
  }

  const handleDelete = useCallback((matchId: string) => {
    deleteCompletedMatch(matchId);
    setMatches(prev => prev.filter(m => m.matchId !== matchId));
  }, []);

  const openDeleteDialog = (match: MatchData) => {
    setDialogConfig({
      title: t('deleteMatchConfirmation.title'),
      description: t('deleteMatchConfirmation.description', { own: match.teamNames.own, rival: match.teamNames.rival, date: new Date(match.date).toLocaleDateString() }),
      onConfirm: () => handleDelete(match.matchId)
    });
  };

  const closeDialog = () => setDialogConfig(null);

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto animate-in fade-in-50">
        <CardHeader>
          <div className='flex items-center justify-between'>
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 text-center">
              <CardTitle className="text-xl sm:text-2xl font-headline flex items-center justify-center gap-2">
                <History className="w-6 h-6" />
                {t('matchHistory')}
              </CardTitle>
              <CardDescription>{t('viewCompletedMatches')}</CardDescription>
            </div>
            <div className='w-10'></div> {/* Spacer */}
          </div>
        </CardHeader>
        <CardContent>
          {matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match) => (
                <div key={match.matchId} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 cursor-pointer" onClick={() => handleSelect(match.matchId)}>
                    <p className="font-semibold">{match.teamNames.own} vs {match.teamNames.rival}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(match.date).toLocaleDateString()} - {t('finalScore')}: {match.setsWon.own} - {match.setsWon.rival}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog(match)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">{t('noMatchesInHistory')}</p>
          )}
        </CardContent>
      </Card>

      {dialogConfig && (
        <ConfirmationDialog
          open={!!dialogConfig}
          onOpenChange={(open) => !open && closeDialog()}
          title={dialogConfig.title}
          description={dialogConfig.description}
          onConfirm={() => {
            dialogConfig.onConfirm();
            closeDialog();
          }}
        />
      )}
    </>
  );
}
