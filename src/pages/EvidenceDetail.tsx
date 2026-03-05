/*
  Evidence Detail Page. 
  Loads one disease-target and renders its full detail page.
*/
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { TDLBadge } from '@/components/TDLBadge';
import { fetchAssociationById } from '@/lib/api';
import { REFERENCE_TYPE_WEIGHTS, type ReferenceType, type EvidenceTrail, type DiseaseTargetAssociation } from '@/types/tictac';

const EvidenceCard = ({ evidence }: { evidence: EvidenceTrail }) => {

  return (
    <Card className="group hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
            <h4 className="font-medium text-foreground mb-1 line-clamp-2">
              {evidence.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              {evidence.studyType} • {evidence.phase} ({evidence.overallStatus})
            </p>
            <div className="flex flex-wrap gap-2">
              {evidence.nctId !== 'N/A' && (
                <a
                  href={`https://clinicaltrials.gov/study/${evidence.nctId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {evidence.nctId}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
      </CardContent>
    </Card>
  );
};

const EvidenceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [association, setAssociation] = useState<DiseaseTargetAssociation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // When ID changes do API request
  useEffect(() => {
    const load = async () => {
      if (!id) {
        setAssociation(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const result = await fetchAssociationById(id);
        setAssociation(result);
      } catch {
        setAssociation(null);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  // Organize evidence by 3 types
  const groupedEvidence = useMemo(() => {
    if (!association) {
      return { RESULT: [], BACKGROUND: [], DERIVED: [] } as Record<ReferenceType, EvidenceTrail[]>;
    }

    return association.evidence.reduce(
      (acc, ev) => {
        return acc;
      },
      { RESULT: [], BACKGROUND: [], DERIVED: [] } as Record<ReferenceType, EvidenceTrail[]>
    );
  }, [association]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!association) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Association Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The requested disease-target association could not be found.
          </p>
          <Link to="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const scoreGradient = `linear-gradient(90deg, hsl(var(--tdl-tdark)) 0%, hsl(var(--tdl-tbio)) 33%, hsl(var(--tdl-tchem)) 66%, hsl(var(--tdl-tclin)) 100%)`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <FlaskConical className="h-6 w-6" />
            <span className="font-bold text-lg">TICTAC</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link to={`/dashboard?disease=${encodeURIComponent(association.diseaseId)}`}>
          <Button variant="ghost" size="sm" className="mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {association.diseaseName}
          </Button>
        </Link>

        {/* Association Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl md:text-3xl">
                    {association.geneSymbol}
                  </CardTitle>
                  <TDLBadge tdl={association.tdl} />
                </div>
                <p className="text-lg text-muted-foreground">{association.geneName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  UniProt: {association.uniprotId}
                </p>
              </div>

              {/* Score Display */}
              <div className="text-center md:text-right">
                <div className="text-4xl font-bold text-primary mb-1">
                  {association.meanRankScore.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Mean Rank Score</div>
                <div
                  className="w-32 h-2 rounded-full mt-2"
                  style={{ background: scoreGradient }}
                >
                  <div
                    className="h-full bg-transparent relative"
                    style={{ width: `${association.meanRankScore}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full shadow" />
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <FlaskConical className="h-4 w-4" />
              <span>{association.diseaseName}</span>
              <span className="text-xs">({association.diseaseId})</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{association.nPub}</div>
                <div className="text-sm text-muted-foreground">Publications</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{association.nStud}</div>
                <div className="text-sm text-muted-foreground">Studies</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{association.nDrug}</div>
                <div className="text-sm text-muted-foreground">Drugs</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">
                  {(association.studyNewness * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Newness</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Trail */}
        <h2 className="text-xl font-semibold mb-4">Evidence Trail</h2>
        <p className="text-muted-foreground mb-6">
          Tracing the provenance of this association back to clinical trials.
        </p>

        <div className="space-y-6">
          {(['RESULT', 'BACKGROUND', 'DERIVED'] as const).map((refType) => {
            const evidence = groupedEvidence[refType];
            if (evidence.length === 0) return null;

            return (
              <Collapsible key={refType} defaultOpen={refType === 'RESULT'}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto rounded-lg border bg-card hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {evidence.length} reference{evidence.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Weight: {REFERENCE_TYPE_WEIGHTS[refType]}
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {evidence.map((ev) => (
                    <EvidenceCard key={ev.id} evidence={ev} />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default EvidenceDetail;
