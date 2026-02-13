/*
  Main API Request function
*/

import type { DiseaseTargetAssociation, Evidence, TDL } from '@/types/tictac';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

// Keep URL building in one place
// E.g: buildUrl("/search", { q: "diabetes", page: 2 })
// Output:{url}/search?q=diabetes&page=2
const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined>) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');

  const rawUrl = /^https?:\/\//i.test(normalizedBase)
    ? `${normalizedBase}${normalizedPath}`
    : `${normalizedBase}${normalizedPath}`;

  // Relative API base (e.g. /api/v1) works with Vite proxy in dev
  const url = new URL(rawUrl, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};


// API request main 
const fetchJson = async <T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> => {
  
  const response = await fetch(buildUrl(path, params));
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
};


// Helper functions
const asArray = <T>(payload: unknown): T[] => {
  // Get [items] from the API response
  if (Array.isArray(payload)) return payload as T[];

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
  }

  return [];
};

const readNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback;
};

const normalizeTdl = (value: unknown): TDL => {
  const raw = readString(value).toLowerCase();
  if (raw === 'tclin') return 'Tclin';
  if (raw === 'tchem') return 'Tchem';
  if (raw === 'tbio') return 'Tbio';
  return 'Tdark';
};


type SummaryRow = Record<string, unknown>;
type EvidenceRow = Record<string, unknown>;


// Mapping Helpers
const mapSummaryRow = (row: SummaryRow): DiseaseTargetAssociation => {
  const diseaseId = readString(row.doid);
  const uniprotId = readString(row.uniprot);
  const id = readString(row.disease_target) || `${diseaseId}_${uniprotId}`;

  const score = readNumber(row.meanrankscore, 0);

  const percentile = readNumber(row.percentile_meanrank, 0);

  return {
    id,
    geneSymbol: readString(row.gene_symbol),
    geneName: readString(row.tcrdtargetname, readString(row.gene_symbol)),
    uniprotId,
    diseaseName: readString(row.disease_name, diseaseId),
    diseaseId,
    tdl: normalizeTdl(row.idgtdl),
    meanRankScore: score,
    nPub: readNumber(row.n_publications ?? row.npub),
    nStud: readNumber(row.n_studies ?? row.nstud),
    nDrug: readNumber(row.n_drugs ?? row.ndrug),
    studyNewness: percentile > 1 ? percentile / 100 : percentile,
    evidence: [],
  };
};

const mapEvidenceRow = (row: EvidenceRow, index: number): Evidence => {
  const citation = readString(row.citation);
  const title = citation || readString(row.official_title, 'Clinical evidence record');

  return {
    id: `${readString(row.nct_id, 'nct')}-${index}`,
    nctId: readString(row.nct_id, 'N/A'),
    pmid: readString(row.pmid) || undefined,
    title,
    authors: 'N/A',
    journal: 'N/A',
    year: readNumber(row.publication_year ?? row.year, new Date().getFullYear()),
    referenceType: 'RESULT',
    abstract: readString(row.study_title) || undefined,
  };
};


// API endpoints all below
export const fetchHealth = async (): Promise<{ status: string }> => {
  return fetchJson<{ status: string }>('/meta/health');
};

export const fetchCounts = async (): Promise<Record<string, unknown>> => {
  return fetchJson<Record<string, unknown>>('/meta/counts');
};

export const fetchAssociationSummary = async (params: {
  doid?: string;
  gene_symbol?: string;
  uniprot?: string;
  min_score?: number;
  limit?: number;
  offset?: number;
}): Promise<DiseaseTargetAssociation[]> => {
  const payload = await fetchJson<unknown>('/associations/summary', params);
  return asArray<SummaryRow>(payload).map(mapSummaryRow);
};

export const fetchAssociationEvidence = async (params: {
  doid?: string;
  uniprot?: string;
  disease_name?: string;
  gene_symbol?: string;
  molecule_chembl_id?: string;
  nct_id?: string;
  phase?: string;
  overall_status?: string;
  exclude_withdrawn?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Evidence[]> => {
  const payload = await fetchJson<unknown>('/associations/evidence', params);
  return asArray<EvidenceRow>(payload).map(mapEvidenceRow);
};

export const fetchDiseaseSearch = async (q: string, limit = 8): Promise<Array<{ doid: string; disease_name: string }>> => {
  const payload = await fetchJson<unknown>('/diseases/search', { q, limit });
  const rows = asArray<Record<string, unknown>>(payload);

  return rows.map((row) => ({
    doid: readString(row.doid),
    disease_name: readString(row.disease_name),
  }));
};

export const fetchTargetSearch = async (q: string, limit = 8): Promise<Array<{ gene_symbol: string; uniprot: string; idgtdl: TDL; tcrdtargetname: string }>> => {
  const payload = await fetchJson<unknown>('/targets/search', { q, limit });
  const rows = asArray<Record<string, unknown>>(payload);

  return rows.map((row) => ({
    gene_symbol: readString(row.gene_symbol),
    uniprot: readString(row.uniprot),
    idgtdl: normalizeTdl(row.idgtdl),
    tcrdtargetname: readString(row.tcrdtargetname, readString(row.gene_symbol)),
  }));
};

export const fetchAssociationById = async (diseaseTarget: string): Promise<DiseaseTargetAssociation | null> => {
  let summary: DiseaseTargetAssociation | null = null;

  const [doid, uniprot] = diseaseTarget.includes('_') ? diseaseTarget.split('_') : ['', ''];

  if (doid && uniprot) {
    const matches = await fetchAssociationSummary({ doid, uniprot, limit: 1 });
    summary = matches[0] ?? null;
  }

  const evidence = await fetchAssociationEvidence({ doid, uniprot, limit: 100 });

  if (summary) {
    return {
      ...summary,
      evidence,
    };
  }

  if (evidence.length === 0) {
    return null;
  }

  return {
    id: diseaseTarget,
    geneSymbol: 'Unknown',
    geneName: 'Unknown target',
    uniprotId: uniprot || 'Unknown',
    diseaseName: doid || 'Unknown disease',
    diseaseId: doid || 'Unknown',
    tdl: 'Tdark',
    meanRankScore: 0,
    nPub: evidence.filter((item) => Boolean(item.pmid)).length,
    nStud: evidence.length,
    nDrug: 0,
    studyNewness: 0,
    evidence,
  };
};
