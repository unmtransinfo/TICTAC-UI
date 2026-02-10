import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TDLBadge } from '@/components/TDLBadge';
import type { DiseaseTargetAssociation } from '@/types/tictac';
import { cn } from '@/lib/utils';

interface EvidenceTableProps {
    data: DiseaseTargetAssociation[];
    className?: string;
}

type SortKey = 'geneSymbol' | 'tdl' | 'meanRankScore' | 'nPub' | 'nStud' | 'nDrug';
type SortOrder = 'asc' | 'desc';

const TDL_ORDER = { Tclin: 0, Tchem: 1, Tbio: 2, Tdark: 3 };

export const EvidenceTable = ({ data, className }: EvidenceTableProps) => {
    const [sortKey, setSortKey] = useState<SortKey>('meanRankScore');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            let comparison = 0;

            if (sortKey === 'tdl') {
                comparison = TDL_ORDER[a.tdl] - TDL_ORDER[b.tdl];
            } else if (sortKey === 'geneSymbol') {
                comparison = a.geneSymbol.localeCompare(b.geneSymbol);
            } else {
                comparison = a[sortKey] - b[sortKey];
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [data, sortKey, sortOrder]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };

    const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
        if (sortKey !== columnKey) {
            return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
        }
        return sortOrder === 'asc' ? (
            <ArrowUp className="ml-1 h-3 w-3" />
        ) : (
            <ArrowDown className="ml-1 h-3 w-3" />
        );
    };

    const SortableHeader = ({
        columnKey,
        children,
    }: {
        columnKey: SortKey;
        children: React.ReactNode;
    }) => (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort(columnKey)}
            className={cn(
                '-ml-3 h-8 font-medium',
                sortKey === columnKey && 'text-primary'
            )}
        >
            {children}
            <SortIcon columnKey={columnKey} />
        </Button>
    );

    return (
        <div className={cn('rounded-lg border bg-card', className)}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <SortableHeader columnKey="geneSymbol">Gene</SortableHeader>
                        </TableHead>
                        <TableHead>
                            <SortableHeader columnKey="tdl">TDL</SortableHeader>
                        </TableHead>
                        <TableHead className="text-right">
                            <SortableHeader columnKey="meanRankScore">Score</SortableHeader>
                        </TableHead>
                        <TableHead className="text-right">
                            <SortableHeader columnKey="nPub">Pubs</SortableHeader>
                        </TableHead>
                        <TableHead className="text-right">
                            <SortableHeader columnKey="nStud">Studies</SortableHeader>
                        </TableHead>
                        <TableHead className="text-right">
                            <SortableHeader columnKey="nDrug">Drugs</SortableHeader>
                        </TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.map((association) => (
                        <TableRow
                            key={association.id}
                            className="group cursor-pointer hover:bg-muted/50"
                        >
                            <TableCell>
                                <div>
                                    <div className="font-semibold text-foreground">
                                        {association.geneSymbol}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                        {association.geneName}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <TDLBadge tdl={association.tdl} />
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all"
                                            style={{ width: `${association.meanRankScore}%` }}
                                        />
                                    </div>
                                    <span className="font-mono text-sm w-12 text-right">
                                        {association.meanRankScore.toFixed(1)}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {association.nPub.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {association.nStud}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {association.nDrug}
                            </TableCell>
                            <TableCell>
                                <Link to={`/evidence/${association.id}`}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
