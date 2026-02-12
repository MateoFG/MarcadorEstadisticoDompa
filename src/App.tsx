import { HomeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import StartScreen from '@/components/start-screen';
import ServeSelectionScreen from '@/components/serve-selection-screen';
import Scoreboard from '@/components/scoreboard';
import LiveStats from '@/components/live-stats';
import PointButtons from '@/components/point-buttons';
import MatchReport from '@/components/match-report';
import HistoryScreen from '@/components/history-screen';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useViewMode, ViewModeProvider } from '@/components/view-mode-provider';
import { ViewModeToggle } from '@/components/view-mode-toggle';
import { cn } from '@/lib/utils';
import { LanguageToggle } from '@/components/language-toggle';
import { useMatchState } from '@/hooks/use-match-state';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { Toaster } from '@/components/ui/toaster';

function AppContent() {
    const { t } = useTranslation();
    const { viewMode } = useViewMode();

    const {
        matchData,
        viewState,
        setViewState,
        isMounted,
        isMatchSaved,
        dialogConfig,
        currentSetPointCounts,
        currentSetScore,
        servingTeam,
        canResetCurrentSet,
        handleAddPoint,
        handleUndo,
        handleEndMatch,
        handleSaveMatch,
        handleStartNewMatch,
        handleViewHistory,
        handleSelectHistoryMatch,
        handleRotationChange,
        handleTeamNameChange,
        handleTeamColorChange,
        handleStartMatch,
        handleSelectFirstServe,
        handleResetCurrentSet,
        openDialog,
        closeDialog
    } = useMatchState();

    if (!isMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const renderContent = () => {
        switch (viewState) {
            case 'serving':
                return (
                    <ServeSelectionScreen
                        teamNames={matchData.teamNames}
                        onSelectServe={handleSelectFirstServe}
                        setNumber={matchData.currentSet}
                    />
                );
            case 'match':
            case 'report':
                return (
                    <div className="flex flex-col gap-4 flex-grow">
                        {viewState === 'match' && (
                            <>
                                <Scoreboard
                                    teamNames={matchData.teamNames}
                                    currentSet={matchData.currentSet}
                                    currentSetScore={currentSetScore}
                                    setsWon={matchData.setsWon}
                                    onTeamNameChange={handleTeamNameChange}
                                    isMatchOver={false}
                                    matchData={matchData}
                                    servingTeam={servingTeam}
                                    currentRotation={matchData.currentRotation}
                                    onRotationChange={handleRotationChange}
                                />
                                <LiveStats pointCounts={currentSetPointCounts} />
                                <PointButtons
                                    onAddPoint={handleAddPoint}
                                    onUndo={handleUndo}
                                    canUndo={matchData.currentSetPointsLog.length > 0}
                                    canResetSet={canResetCurrentSet}
                                    onResetSet={() => openDialog({
                                        title: t('resetCurrentSet'),
                                        description: t('resetCurrentSetDescription'),
                                        onConfirm: handleResetCurrentSet,
                                    })}
                                    onEndMatch={() => openDialog({
                                        title: t('endMatchQuestion'),
                                        description: t('endMatchDescription'),
                                        onConfirm: handleEndMatch,
                                    })}
                                    teamColors={matchData.teamColors}
                                    servingTeam={servingTeam}
                                />
                            </>
                        )}
                        {viewState === 'report' && (
                            <MatchReport
                                matchData={matchData}
                                isMatchSaved={isMatchSaved}
                                onSaveMatch={() => openDialog({
                                    title: t('saveMatch'),
                                    description: t('saveMatchDescription'),
                                    onConfirm: handleSaveMatch,
                                })}
                                onStartNewMatch={() => openDialog({
                                    title: t('startNewMatch'),
                                    description: t('startNewMatchDescription'),
                                    onConfirm: handleStartNewMatch,
                                })}
                            />
                        )}
                        <div className="mt-auto pt-4 flex justify-center">
                            <Button onClick={() => openDialog({
                                title: t('backToHome'),
                                description: t('backToHomeDescription'),
                                onConfirm: () => setViewState('start')
                            })}
                                variant="ghost"
                                className="gap-2 text-muted-foreground"
                            >
                                <HomeIcon className="w-4 h-4" />
                                {t('backToHome')}
                            </Button>
                        </div>
                    </div>
                );
            case 'history':
                return (
                    <HistoryScreen
                        onSelectMatch={handleSelectHistoryMatch}
                        onBack={() => setViewState('start')}
                    />
                );
            case 'start':
            default:
                return (
                    <StartScreen
                        onStartMatch={handleStartMatch}
                        onTeamNameChange={handleTeamNameChange}
                        onTeamColorChange={handleTeamColorChange}
                        teamNames={matchData.teamNames}
                        teamColors={matchData.teamColors}
                        onViewHistory={handleViewHistory}
                    />
                );
        }
    }

    return (
        <div className="min-h-screen flex flex-col p-2 sm:p-4 font-sans transition-colors bg-background">
            <div
                id="export-container"
                className={cn(
                    'w-full mx-auto transition-all duration-300',
                    viewMode === 'mobile' && 'max-w-lg',
                    viewMode === 'tablet' && 'max-w-3xl',
                    viewMode === 'desktop' && 'max-w-5xl'
                )}
            >
                <header className="w-full mx-auto flex items-center justify-between mb-4 sm:mb-6">
                    <div className='flex items-center gap-2'>
                        <h1 className="text-2xl sm:text-3xl font-headline font-semibold text-foreground/90 tracking-tight">
                            {t('appTitle')}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        <ViewModeToggle />
                        <ThemeToggle />
                    </div>
                </header>

                <main className="flex-grow flex flex-col">
                    {renderContent()}
                </main>

                <footer className="mt-8 text-center text-muted-foreground text-sm">
                    {t('footer')}
                </footer>
            </div>

            {dialogConfig && (
                <ConfirmationDialog
                    open={!!dialogConfig}
                    onOpenChange={(open) => !open && closeDialog()}
                    title={dialogConfig.title}
                    description={dialogConfig.description}
                    confirmText={dialogConfig.confirmText}
                    cancelText={dialogConfig.cancelText}
                    onConfirm={() => {
                        dialogConfig.onConfirm();
                        closeDialog();
                    }}
                    onCancel={() => {
                        if (dialogConfig.onCancel) dialogConfig.onCancel();
                        closeDialog();
                    }}
                />
            )}
            <Toaster />
        </div>
    );
}

export default function App() {
    return (
        <LanguageProvider>
            <ThemeProvider storageKey="voleyball-theme">
                <ViewModeProvider>
                    <AppContent />
                </ViewModeProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}
