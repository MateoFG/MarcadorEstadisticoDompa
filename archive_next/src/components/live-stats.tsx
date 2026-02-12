"use client";

import { BarChart, Shield, CheckCircle, AlertTriangle, Swords } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PointCounts } from "@/lib/types";
import { useTranslation } from "react-i18next";

const StatItem = ({ icon: Icon, label, value, colorClass }: { icon: React.ElementType, label: string, value: number, colorClass: string }) => (
  <div className="flex items-center justify-between p-2 rounded-lg bg-secondary">
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${colorClass}`} />
      <span className="font-medium text-secondary-foreground text-xs sm:text-sm">{label}</span>
    </div>
    <span className={`font-bold text-sm sm:text-base ${colorClass}`}>{value}</span>
  </div>
);

export default function LiveStats({ pointCounts }: {pointCounts: PointCounts}) {
  const { t } = useTranslation();
  const { PPM, PRE, PPE, PRM } = pointCounts;

  const pointTypeLabels = {
    PPM: t('pointTypes.PPM'),
    PRE: t('pointTypes.PRE'),
    PPE: t('pointTypes.PPE'),
    PRM: t('pointTypes.PRM'),
  };

  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground/90">
          <BarChart className="w-5 h-5 text-primary" />
          {t('setStats')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-2 gap-2">
          <StatItem icon={Shield} label={pointTypeLabels.PPM} value={PPM} colorClass="text-accent" />
          <StatItem icon={CheckCircle} label={pointTypeLabels.PRE} value={PRE} colorClass="text-destructive opacity-70" />
          <StatItem icon={AlertTriangle} label={pointTypeLabels.PPE} value={PPE} colorClass="text-accent opacity-70" />
          <StatItem icon={Swords} label={pointTypeLabels.PRM} value={PRM} colorClass="text-destructive" />
        </div>
      </CardContent>
    </Card>
  );
}
