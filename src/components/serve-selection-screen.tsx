

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt, Volleyball } from 'lucide-react';
import { useTranslation } from "react-i18next";

interface ServeSelectionScreenProps {
  onSelectServe: (team: 'own' | 'rival') => void;
  teamNames: { own: string; rival: string };
  setNumber: number;
}

export default function ServeSelectionScreen({ onSelectServe, teamNames, setNumber }: ServeSelectionScreenProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="p-4 sm:p-6 text-center">
          <Volleyball className="w-10 h-10 mx-auto text-primary mb-2" />
          <CardTitle className="text-xl sm:text-2xl font-headline">{t('firstServe', { setNumber })}</CardTitle>
          <CardDescription className="text-foreground/60 text-sm sm:text-base">{t('whoServesFirst')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 sm:px-6 pb-4 sm:pb-6">
          <Button
            onClick={() => onSelectServe('own')}
            className="w-full text-base sm:text-lg h-20 sm:h-24 flex flex-col gap-2"
            variant="outline"
          >
            <Shirt className="w-6 h-6 text-accent fill-current" />
            <span>{teamNames.own}</span>
          </Button>
          <Button
            onClick={() => onSelectServe('rival')}
            className="w-full text-base sm:text-lg h-20 sm:h-24 flex flex-col gap-2"
            variant="outline"
          >
            <Shirt className="w-6 h-6 text-destructive fill-current" />
            <span>{teamNames.rival}</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
