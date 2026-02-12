"use client";

import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RotationStatsTableProps {
    rotationStats: Record<number, { gp: number; sideouts: number; sideoutChances: number; }>;
}

export const RotationStatsTable = ({ rotationStats }: RotationStatsTableProps) => {
    const { t } = useTranslation();

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-20 text-center font-bold">{t('rot')}</TableHead>
                        <TableHead className="text-center font-bold">{t('gp')}</TableHead>
                        <TableHead className="text-center font-bold">{t('sideoutPercentage')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[1, 6, 5, 4, 3, 2].map((rot) => {
                        const stats = rotationStats[rot] || { gp: 0, sideouts: 0, sideoutChances: 0 };
                        const sideoutPct = stats.sideoutChances > 0
                            ? (stats.sideouts / stats.sideoutChances * 100).toFixed(1)
                            : '0.0';

                        return (
                            <TableRow key={rot}>
                                <TableCell className="text-center font-medium">P{rot}</TableCell>
                                <TableCell className={styleGP(stats.gp)}>
                                    {stats.gp > 0 ? `+${stats.gp}` : stats.gp}
                                </TableCell>
                                <TableCell className="text-center">
                                    {sideoutPct}%
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

const styleGP = (gp: number) => {
    let classes = "text-center font-bold ";
    if (gp > 0) classes += "text-green-600 dark:text-green-400";
    else if (gp < 0) classes += "text-red-600 dark:text-red-400";
    else classes += "text-muted-foreground";
    return classes;
};
