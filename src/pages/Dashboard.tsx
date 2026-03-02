/**
 * Dashboard.tsx has two simple modes:
 * 1) Association mode (existing behavior): if URL has `disease` or `gene`, render the old dashboard
 *    with stats + scatter plot + evidence table.
 * 2) Provenance mode (new default): plain `/dashboard` renders a provenance summary table.
 *
 * Note: reference_type (RESULT/BACKGROUND/DERIVED) is currently not returned by this
 * provenance summary endpoint/DB view, so that filter is shown as not available.
 */

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FlaskConical, Target, FileText, Beaker, ChevronLeft, ChevronRight, Database, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchBar } from '@/components/SearchBar';
import { EvidenceScatterPlot } from '@/components/EvidenceScatterPlot';
import { EvidenceTable } from '@/components/EvidenceTable';
import { TDLBadge } from '@/components/TDLBadge';
import { fetchAssociationSummary, fetchProvenanceSummary, type ProvenanceSummaryItem } from '@/lib/api';
import type { DiseaseTargetAssociation } from '@/types/tictac';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const diseaseId = searchParams.get('disease') ?? undefined;
  const geneSymbol = searchParams.get('gene') ?? undefined;

  const view = searchParams.get('view');
  /* association mode if we have params AND user hasn't explicitly asked for provenance view */
  const isAssociationMode = Boolean((diseaseId || geneSymbol) && view !== 'provenance');

  // -------------------------
  // Association mode state
  // -------------------------
  const [data, setData] = useState<DiseaseTargetAssociation[]>([]);
  const [isLoadingAssociation, setIsLoadingAssociation] = useState(true);

  // Advanced Filtering State
  const [selectedTDLs, setSelectedTDLs] = useState<Set<string>>(new Set(['Tclin', 'Tchem', 'Tbio', 'Tdark']));
  const [geneFilter, setGeneFilter] = useState('');
  const [yAxisVar, setYAxisVar] = useState<'nPub' | 'nStud' | 'nDrug'>('nPub');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesTDL = selectedTDLs.has(item.tdl);
      const matchesGene = item.geneSymbol.toLowerCase().includes(geneFilter.toLowerCase()) ||
        item.geneName.toLowerCase().includes(geneFilter.toLowerCase());
      return matchesTDL && matchesGene;
    });
  }, [data, selectedTDLs, geneFilter]);

  const toggleTDL = (tdl: string) => {
    setSelectedTDLs((prev) => {
      const next = new Set(prev);
      if (next.has(tdl)) {
        if (next.size > 1) next.delete(tdl);
      } else {
        next.add(tdl);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!isAssociationMode) return;

    const load = async () => {
      setIsLoadingAssociation(true);
      try {
        const rows = await fetchAssociationSummary({
          doid: diseaseId,
          gene_symbol: geneSymbol,
          limit: 5000,
        });
        setData(rows);
      } catch {
        setData([]);
      } finally {
        setIsLoadingAssociation(false);
      }
    };

    void load();
  }, [diseaseId, geneSymbol, isAssociationMode]);

  const title = useMemo(() => {
    if (diseaseId && data.length > 0) return data[0].diseaseName;
    if (geneSymbol && data.length > 0) return data[0].geneSymbol;
    if (geneSymbol) return geneSymbol;
    if (diseaseId) return diseaseId;
    return 'All Disease-Target Associations';
  }, [data, diseaseId, geneSymbol]);

  const subtitle = useMemo(() => {
    if (diseaseId && data.length > 0) return data[0].diseaseId;
    if (geneSymbol && data.length > 0) return data[0].geneName;
    return 'Explore the complete TICTAC dataset';
  }, [data, diseaseId, geneSymbol]);

  const stats = useMemo(() => {
    if (diseaseId) {
      const tclinCount = data.filter((a) => a.tdl === 'Tclin').length;
      const avgScore = data.reduce((acc, a) => acc + a.meanRankScore, 0) / data.length || 0;

      return [
        { label: 'Targets', value: data.length, icon: Target },
        { label: 'Tclin Targets', value: tclinCount, icon: Beaker },
        { label: 'Avg. Score', value: avgScore.toFixed(1), icon: FlaskConical },
        {
          label: 'Publications',
          value: data.reduce((acc, a) => acc + a.nPub, 0).toLocaleString(),
          icon: FileText,
        },
      ];
    }

    if (geneSymbol) {
      const avgScore = data.reduce((acc, a) => acc + a.meanRankScore, 0) / data.length || 0;

      return [
        { label: 'Diseases', value: data.length, icon: FlaskConical },
        { label: 'TDL', value: data[0]?.tdl ?? 'Unknown', icon: Target },
        { label: 'Avg. Score', value: avgScore.toFixed(1), icon: Beaker },
        {
          label: 'Publications',
          value: data.reduce((acc, a) => acc + a.nPub, 0).toLocaleString(),
          icon: FileText,
        },
      ];
    }

    const uniqueDiseases = new Set(data.map((d) => d.diseaseId)).size;
    const uniqueGenes = new Set(data.map((d) => d.geneSymbol)).size;
    const tclinCount = data.filter((a) => a.tdl === 'Tclin').length;

    return [
      { label: 'Associations', value: data.length, icon: Target },
      { label: 'Diseases', value: uniqueDiseases, icon: FlaskConical },
      { label: 'Genes', value: uniqueGenes, icon: Beaker },
      { label: 'Tclin Targets', value: tclinCount, icon: FileText },
    ];
  }, [data, diseaseId, geneSymbol]);

  // -----------------------
  // Provenance mode state
  // -------------------------
  const [provenanceRows, setProvenanceRows] = useState<ProvenanceSummaryItem[]>([]);
  const [isLoadingProvenance, setIsLoadingProvenance] = useState(true);
  const [uniprotInput, setUniprotInput] = useState('');
  const [referenceInput, setReferenceInput] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (isAssociationMode) return;

    const load = async () => {
      setIsLoadingProvenance(true);
      try {
        const rows = await fetchProvenanceSummary({
          doid: diseaseId,
          gene_symbol: geneSymbol,
          limit: 5000
        });
        setProvenanceRows(rows);
      } catch {
        setProvenanceRows([]);
      } finally {
        setIsLoadingProvenance(false);
      }
    };

    void load();
  }, [isAssociationMode, diseaseId, geneSymbol]);

  // Live client-side filtering
  const filteredRows = useMemo(() => {
    const u = uniprotInput.trim().toLowerCase();
    const r = referenceInput.trim().toLowerCase();
    if (!u && !r) return provenanceRows;
    return provenanceRows.filter((row) => {
      const matchUniprot = !u || (row.uniprot ?? '').toLowerCase().includes(u);
      const matchRef =
        !r ||
        (row.nct_id ?? '').toLowerCase().includes(r) ||
        String(row.pmid ?? '').toLowerCase().includes(r) ||
        (row.citation ?? '').toLowerCase().includes(r);
      return matchUniprot && matchRef;
    });
  }, [provenanceRows, uniprotInput, referenceInput]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [uniprotInput, referenceInput, pageSize]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize,
  );
  const showingFrom = filteredRows.length === 0 ? 0 : currentPage * pageSize + 1;
  const showingTo = Math.min((currentPage + 1) * pageSize, filteredRows.length);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
              <FlaskConical className="h-6 w-6" />
              <span className="font-bold text-lg">TICTAC</span>
            </Link>

          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isAssociationMode ? (
          <>
            {(diseaseId || geneSymbol) && (
              <Link
                to={`/dashboard?view=provenance${diseaseId ? `&disease=${encodeURIComponent(diseaseId)}` : ''}${geneSymbol ? `&gene=${encodeURIComponent(geneSymbol)}` : ''}`}
                className="group inline-flex items-center gap-3 p-1 pr-4 mb-8 rounded-full bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/20 transition-all shadow-sm active:scale-[0.98]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Database className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">
                  View Provenance Dashboard for <span className="text-primary font-bold">{title}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
                {geneSymbol && data[0]?.tdl && <TDLBadge tdl={data[0].tdl} />}
              </div>
              <p className="text-lg text-muted-foreground">{subtitle}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl bg-card border border-border/50"
                >
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <stat.icon className="h-4 w-4" />
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
              ))}
            </div>

            {isLoadingAssociation ? (
              <div className="text-center py-16 text-muted-foreground">Loading...</div>
            ) : data.length > 0 ? (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                  <div className="space-y-4 order-2 xl:order-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Target Evidence Summary</h2>
                      <div className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        Filtered: <span className="font-bold text-primary">{filteredData.length}</span> targets
                      </div>
                    </div>
                    <EvidenceTable data={filteredData} />
                  </div>

                  <div className="space-y-4 order-1 xl:order-2">
                    <h2 className="text-xl font-semibold">Disease-Target Association</h2>
                    <div className="p-6 rounded-xl bg-card border border-border/50 h-full">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <div className="text-sm font-medium mb-2">Filter by TDL</div>
                          <div className="flex flex-wrap gap-2">
                            {(['Tclin', 'Tchem', 'Tbio', 'Tdark'] as const).map((tdl) => (
                              <button
                                key={tdl}
                                onClick={() => toggleTDL(tdl)}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95",
                                  selectedTDLs.has(tdl)
                                    ? "bg-secondary border-primary/20"
                                    : "bg-muted/30 border-transparent opacity-60"
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-2.5 h-2.5 rounded-full",
                                    tdl === 'Tclin' ? 'bg-tdl-tclin' :
                                      tdl === 'Tchem' ? 'bg-tdl-tchem' :
                                        tdl === 'Tbio' ? 'bg-tdl-tbio' : 'bg-tdl-tdark'
                                  )}
                                />
                                <span className="text-xs font-semibold">{tdl}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">Gene Filter</div>
                          <Input
                            placeholder="Search gene..."
                            value={geneFilter}
                            onChange={(e) => setGeneFilter(e.target.value)}
                            className="h-9"
                          />
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">Y-Axis Variable</div>
                          <select
                            value={yAxisVar}
                            onChange={(e) => setYAxisVar(e.target.value as any)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="nPub">Publications</option>
                            <option value="nStud">Studies</option>
                            <option value="nDrug">Drugs</option>
                          </select>
                        </div>
                      </div>

                      <div className="text-[10px] text-muted-foreground mb-4 italic">
                        Click labels to toggle filter
                      </div>

                      <EvidenceScatterPlot data={filteredData} yAxisKey={yAxisVar} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No associations found</h3>
                <p className="text-muted-foreground mb-6">
                  Try searching for a different disease or gene target.
                </p>
                <SearchBar className="max-w-md mx-auto" />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent border border-primary/10 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Database className="h-8 w-8 text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {diseaseId || geneSymbol ? `Provenance Dashboard for ${title}` : 'Provenance Dashboard'}
                </h1>
              </div>
              <p className="text-muted-foreground mb-4">
                {diseaseId || geneSymbol
                  ? `Detailed clinical trial evidence and publication citations for ${title}.`
                  : 'Aggregate view of evidentiary support across the TICTAC dataset.'}
              </p>
              {(diseaseId || geneSymbol) && (
                <Link
                  to={`/dashboard?${diseaseId ? `disease=${encodeURIComponent(diseaseId)}` : ''}${geneSymbol ? `gene=${encodeURIComponent(geneSymbol)}` : ''}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Return to Association Summary
                </Link>
              )}
            </div>


            <div className="grid gap-3 md:grid-cols-2 mb-6">
              <Input
                value={uniprotInput}
                onChange={(e) => setUniprotInput(e.target.value)}
                placeholder="Filter by UniProt (e.g. P00533)"
              />
              <Input
                value={referenceInput}
                onChange={(e) => setReferenceInput(e.target.value)}
                placeholder="Reference (NCT ID or PMID)"
              />
            </div>

            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DOID</TableHead>
                    <TableHead>UniProt</TableHead>
                    <TableHead>Gene</TableHead>
                    <TableHead>NCT ID</TableHead>
                    <TableHead>PMID</TableHead>
                    <TableHead>Citation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingProvenance ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Loading provenance summary...
                      </TableCell>
                    </TableRow>
                  ) : filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {uniprotInput.trim() || referenceInput.trim() ? (
                          <>No results found for <strong>{uniprotInput.trim() || referenceInput.trim()}</strong></>
                        ) : (
                          'No provenance rows found.'
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRows.map((row) => (
                      <TableRow key={`${row.disease_target}-${row.nct_id}-${row.pmid ?? 'none'}`}>
                        <TableCell>{row.doid}</TableCell>
                        <TableCell className="font-mono">{row.uniprot}</TableCell>
                        <TableCell>{row.gene_symbol}</TableCell>
                        <TableCell>
                          {row.nct_id ? (
                            <a
                              href={`https://clinicaltrials.gov/study/${row.nct_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              {row.nct_id}
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {row.pmid ? (
                            <a
                              href={row.pubmed_url ?? `https://pubmed.ncbi.nlm.nih.gov/${row.pmid}/`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              {row.pmid}
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {row.citation ?? '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination bar */}
            {!isLoadingProvenance && filteredRows.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <label htmlFor="pageSize" className="text-muted-foreground">Show entries:</label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                  >
                    {[20, 30, 40, 50].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <span className="text-sm text-muted-foreground">
                  Showing {showingFrom}–{showingTo} of {filteredRows.length} entries
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
