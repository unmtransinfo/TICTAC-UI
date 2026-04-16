import { TDLBadge } from "@/components/TDLBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DiseaseTargetAssociation } from "@/types/tictac";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface EvidenceTableProps {
  data: DiseaseTargetAssociation[];
  className?: string;
}

type SortKey =
  | "uniprotId"
  | "geneSymbol"
  | "tdl"
  | "meanRankScore"
  | "nPub"
  | "nStud"
  | "nDrug";
type SortOrder = "asc" | "desc";

const TDL_ORDER = { Tclin: 0, Tchem: 1, Tbio: 2, Tdark: 3 };

const SortIcon = ({
  columnKey,
  sortKey,
  sortOrder,
}: {
  columnKey: SortKey;
  sortKey: SortKey;
  sortOrder: SortOrder;
}) => {
  if (sortKey !== columnKey) {
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
  }
  return sortOrder === "asc" ? (
    <ArrowUp className="ml-1 h-3 w-3" />
  ) : (
    <ArrowDown className="ml-1 h-3 w-3" />
  );
};

const SortableHeader = ({
  columnKey,
  children,
  sortKey,
  sortOrder,
  onSort,
}: {
  columnKey: SortKey;
  children: React.ReactNode;
  sortKey: SortKey;
  sortOrder: SortOrder;
  onSort: (key: SortKey) => void;
}) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => onSort(columnKey)}
    className={cn(
      "-ml-3 h-8 font-medium",
      sortKey === columnKey && "text-primary",
    )}
  >
    {children}
    <SortIcon columnKey={columnKey} sortKey={sortKey} sortOrder={sortOrder} />
  </Button>
);

export const EvidenceTable = ({ data, className }: EvidenceTableProps) => {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>("meanRankScore");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(0);
  }, [data]);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison: number;

      if (sortKey === "tdl") {
        comparison = TDL_ORDER[a.tdl] - TDL_ORDER[b.tdl];
      } else if (sortKey === "geneSymbol" || sortKey === "uniprotId") {
        comparison = a[sortKey].localeCompare(b[sortKey]);
      } else {
        comparison = a[sortKey] - b[sortKey];
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [data, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    return sortedData.slice(
      currentPage * pageSize,
      currentPage * pageSize + pageSize,
    );
  }, [sortedData, currentPage]);

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      setSortOrder("desc");
      return key;
    });
  }, []);

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortableHeader
                columnKey="geneSymbol"
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              >
                Gene
              </SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader
                columnKey="uniprotId"
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              >
                Target
              </SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader
                columnKey="tdl"
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              >
                TDL
              </SortableHeader>
            </TableHead>
            <TableHead className="text-right">
              <SortableHeader
                columnKey="meanRankScore"
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              >
                Score
              </SortableHeader>
            </TableHead>
            <TableHead className="text-right">
              <SortableHeader
                columnKey="nPub"
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              >
                Pubs
              </SortableHeader>
            </TableHead>
            <TableHead className="text-right">
              <SortableHeader
                columnKey="nStud"
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              >
                Studies
              </SortableHeader>
            </TableHead>
            <TableHead className="text-right">
              <SortableHeader
                columnKey="nDrug"
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              >
                Drugs
              </SortableHeader>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((association) => (
            <TableRow
              key={association.id}
              className="group cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(`/evidence/${association.id}`)}
            >
              <TableCell className="font-mono text-xs text-muted-foreground">
                {association.geneSymbol}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-semibold text-foreground">
                    {association.uniprotId}
                  </div>
                  {association.targetName &&
                    association.targetName !== association.geneSymbol && (
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {association.targetName}
                      </div>
                    )}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.length > 20 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 gap-4 border-t bg-muted/30">
          <div className="flex items-center gap-4 order-2 sm:order-1">
            <div className="text-sm text-muted-foreground">
              Showing {currentPage * pageSize + 1} to{" "}
              {Math.min((currentPage + 1) * pageSize, data.length)} of{" "}
              {data.length}
            </div>
            <div className="flex items-center gap-2 text-sm border-l pl-4">
              <span className="text-muted-foreground whitespace-nowrap">
                Show entries:
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="bg-transparent border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {[20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 order-1 sm:order-2 ml-auto sm:ml-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={currentPage >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
