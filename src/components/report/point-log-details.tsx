

import { useTranslation } from 'react-i18next';
import { Shirt } from "lucide-react";
import type { PointLog, PointType, PointCategory } from "@/lib/types";

interface PointLogDetailsProps {
    pointLog: PointLog[];
    teamNames: { own: string, rival: string };
    teamColors: { own: string, rival: string };
    pointTypeLabels: Record<PointType, string>;
    pointCategoryLabels: Record<PointCategory, string>;
}

export const PointLogDetails = ({
    pointLog,
    teamNames,
    teamColors,
    pointTypeLabels,
    pointCategoryLabels
}: PointLogDetailsProps) => {
    const { t } = useTranslation();

    if (!pointLog || pointLog.length === 0) {
        return <p>{t('noPointLog')}</p>;
    }

    const getPointLabel = (log: PointLog) => {
        return `${pointTypeLabels[log.type]} (${pointCategoryLabels[log.category] || log.category})`;
    };

    let ownScore = 0;
    let rivalScore = 0;

    return (
        <div className="space-y-2 text-sm sm:text-base">
            <div className="grid grid-cols-2 gap-4 font-semibold border-b pb-2">
                <div className="flex items-center gap-2" style={{ color: `hsl(${teamColors.own})` }}>
                    <Shirt className="w-5 h-5 fill-current" />
                    {teamNames.own}
                </div>
                <div className="flex items-center gap-2" style={{ color: `hsl(${teamColors.rival})` }}>
                    <Shirt className="w-5 h-5 fill-current" />
                    {teamNames.rival}
                </div>
            </div>
            <div className="max-h-60 overflow-y-auto pr-2 text-xs sm:text-sm">
                {pointLog.map((log, index) => {
                    const isOwnPoint = log.type === 'PPM' || log.type === 'PRE';
                    if (isOwnPoint) ownScore++; else rivalScore++;

                    const pointGoesTo = isOwnPoint ? 'own' : 'rival';

                    let pointColor = '';
                    let pointOpacity = 1;

                    if (log.type === 'PPM') { // Own point
                        pointColor = `hsl(${teamColors.own})`;
                    } else if (log.type === 'PRE') { // Rival error -> Own point
                        pointColor = `hsl(${teamColors.rival})`; // Color of team that made the error
                        pointOpacity = 0.7;
                    } else if (log.type === 'PRM') { // Rival point
                        pointColor = `hsl(${teamColors.rival})`;
                    } else if (log.type === 'PPE') { // Own error -> Rival point
                        pointColor = `hsl(${teamColors.own})`; // Color of team that made the error
                        pointOpacity = 0.7;
                    }

                    const pointInfo = `[${ownScore}-${rivalScore}] ${getPointLabel(log)}`;
                    const pointColumn = (
                        <p style={{ color: pointColor, opacity: pointOpacity }}>
                            {pointInfo}
                        </p>
                    );

                    return (
                        <div key={index} className="grid grid-cols-2 gap-4 py-1 border-b border-dashed">
                            <div>{pointGoesTo === 'own' && pointColumn}</div>
                            <div>{pointGoesTo === 'rival' && pointColumn}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
