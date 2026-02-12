"use client";

interface StatsGridProps {
    label: string;
    ownValue: string;
    rivalValue: string;
}

export const StatsGrid = ({ label, ownValue, rivalValue }: StatsGridProps) => (
    <div className="flex justify-between items-center text-center">
        <span className="w-1/3 font-bold">{ownValue}</span>
        <span className="w-1/3 text-xs text-muted-foreground">{label}</span>
        <span className="w-1/3 font-bold">{rivalValue}</span>
    </div>
);
