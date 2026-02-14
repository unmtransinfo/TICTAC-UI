/*
  Dashboard page. Reads query params, fetches association data from the API, 
  computes stats, and renders charts + table
*/

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Target, FileText, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { EvidenceScatterPlot } from '@/components/EvidenceScatterPlot';
import { EvidenceTable } from '@/components/EvidenceTable';
import { TDLBadge } from '@/components/TDLBadge';
import { fetchAssociationSummary } from '@/lib/api';
import type { DiseaseTargetAssociation } from '@/types/tictac';


const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const diseaseId = searchParams.get('disease') ?? undefined;
  const geneSymbol = searchParams.get('gene') ?? undefined;

  const [data, setData] = useState<DiseaseTargetAssociation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // API Request
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const rows = await fetchAssociationSummary({
          doid: diseaseId,
          gene_symbol: geneSymbol,
          limit: 100,
        });
        setData(rows);
      } catch {
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [diseaseId, geneSymbol]);

  // Rturn title
  const title = useMemo(() => {
    if (diseaseId && data.length > 0) return data[0].diseaseName;
    if (geneSymbol && data.length > 0) return data[0].geneSymbol;
    if (geneSymbol) return geneSymbol;
    if (diseaseId) return diseaseId;
    return 'All Disease-Target Associations';
  }, [data, diseaseId, geneSymbol]);

  // Return subtitle
  const subtitle = useMemo(() => {
    if (diseaseId && data.length > 0) return data[0].diseaseId;
    if (geneSymbol && data.length > 0) return data[0].geneName;
    return 'Explore the complete TICTAC dataset';
  }, [data, diseaseId, geneSymbol]);

  // Return stats
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
              <FlaskConical className="h-6 w-6" />
              <span className="font-bold text-lg">TICTAC</span>
            </Link>
            <SearchBar className="flex-1 max-w-xl" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        {(diseaseId || geneSymbol) && (
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all associations
            </Button>
          </Link>
        )}

        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
            {geneSymbol && data[0]?.tdl && <TDLBadge tdl={data[0].tdl} />}
          </div>
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        </div>

        {/* Stats Grid */}
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

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading...</div>
        ) : data.length > 0 ? (
          <>
            {/* Scatter Plot */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Evidence Landscape</h2>
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  <span className="text-muted-foreground">
                    Point size = number of studies • Click to view provenance
                  </span>
                  <div className="flex gap-4 ml-auto">
                    {(['Tclin', 'Tchem', 'Tbio', 'Tdark'] as const).map((tdl) => (
                      <div key={tdl} className="flex items-center gap-1.5">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            tdl === 'Tclin'
                              ? 'bg-tdl-tclin'
                              : tdl === 'Tchem'
                              ? 'bg-tdl-tchem'
                              : tdl === 'Tbio'
                              ? 'bg-tdl-tbio'
                              : 'bg-tdl-tdark'
                          }`}
                        />
                        <span className="text-muted-foreground">{tdl}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <EvidenceScatterPlot data={data} />
              </div>
            </div>

            {/* Evidence Table */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Target Evidence Summary</h2>
              <EvidenceTable data={data} />
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
      </main>
    </div>
  );
};

export default Dashboard;
