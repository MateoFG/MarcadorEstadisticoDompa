

import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RotationStatsTableProps {
    rotationStats: Record<number, { gp: number; sideouts: number; sideoutChances: number; }>;
    rivalRotationStats: Record<number, { gp: number; sideouts: number; sideoutChances: number; }>;
}

export const RotationStatsTable = ({ rotationStats, rivalRotationStats }: RotationStatsTableProps) => {
    const { t } = useTranslation();

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-12 text-center font-bold px-1 text-accent">{t('rot')}</TableHead>
                        <TableHead className="text-center font-bold px-1 text-accent">G-P</TableHead>
                        <TableHead className="text-center font-bold px-1 text-accent text-xs">SO %</TableHead>
                        <TableHead className="text-center font-bold px-1 text-destructive text-xs">SO %</TableHead>
                        <TableHead className="text-center font-bold px-1 text-destructive">G-P</TableHead>
                        <TableHead className="w-12 text-center font-bold px-1 text-destructive">{t('rot')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[1, 6, 5, 4, 3, 2].map((rot) => {
                        const own = rotationStats[rot] || { gp: 0, sideouts: 0, sideoutChances: 0 };
                        const rival = rivalRotationStats[rot] || { gp: 0, sideouts: 0, sideoutChances: 0 };

                        const ownSOPct = own.sideoutChances > 0
                            ? (own.sideouts / own.sideoutChances * 100).toFixed(1)
                            : '0.0';

                        const rivalSOPct = rival.sideoutChances > 0
                            ? (rival.sideouts / rival.sideoutChances * 100).toFixed(1)
                            : '0.0';

                        return (
                            <TableRow key={rot}>
                                <TableCell className="text-center font-bold px-1 text-accent bg-accent/5">P{rot}</TableCell>
                                <TableCell className={styleGP(own.gp) + " px-1"}>
                                    {own.gp > 0 ? `+${own.gp}` : own.gp}
                                </TableCell>
                                <TableCell className="text-center text-xs sm:text-sm px-1 border-r">
                                    {ownSOPct}%
                                </TableCell>
                                <TableCell className="text-center text-xs sm:text-sm px-1">
                                    {rivalSOPct}%
                                </TableCell>
                                <TableCell className={styleGP(rival.gp) + " px-1 border-l text-center"}>
                                    {rival.gp > 0 ? `+${rival.gp}` : rival.gp}
                                </TableCell>
                                <TableCell className="text-center font-bold px-1 text-destructive bg-destructive/5">P{rot}</TableCell>
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
