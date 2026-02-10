// TICTAC Research Platform Types
// Based on the TICTAC paper methodology

export type TDL = 'Tclin' | 'Tchem' | 'Tbio' | 'Tdark';

export type ReferenceType = 'RESULT' | 'BACKGROUND' | 'DERIVED';

export interface Evidence {
  id: string;
  nctId: string; // Clinical Trial ID (e.g., NCT12345678)
  pmid?: string; // PubMed ID
  title: string;
  authors: string;
  journal: string;
  year: number;
  referenceType: ReferenceType;
  abstract?: string;
}

export interface DiseaseTargetAssociation {
  id: string;
  geneSymbol: string;
  geneName: string;
  uniprotId: string;
  diseaseName: string;
  diseaseId: string; // DOID
  tdl: TDL;
  meanRankScore: number; // 0-100, evidence strength
  nPub: number; // Number of publications
  nStud: number; // Number of studies
  nDrug: number; // Number of drugs
  studyNewness: number; // Recency score
  evidence: Evidence[];
}

export interface Disease {
  id: string;
  doid: string;
  name: string;
  synonyms: string[];
  associationCount: number;
}

export interface Gene {
  symbol: string;
  name: string;
  uniprotId: string;
  tdl: TDL;
  associationCount: number;
}

export interface SearchResult {
  type: 'disease' | 'gene';
  id: string;
  name: string;
  subtitle: string;
}

// Weights for reference types (from paper)
export const REFERENCE_TYPE_WEIGHTS: Record<ReferenceType, number> = {
  RESULT: 1.0,
  BACKGROUND: 0.5,
  DERIVED: 0.25,
};

// TDL descriptions
export const TDL_INFO: Record<TDL, { label: string; description: string }> = {
  Tclin: {
    label: 'Tclin',
    description: 'Clinical - Target with approved drug',
  },
  Tchem: {
    label: 'Tchem',
    description: 'Chemical - Target with active compound',
  },
  Tbio: {
    label: 'Tbio',
    description: 'Biological - Target with biological annotation',
  },
  Tdark: {
    label: 'Tdark',
    description: 'Dark - Understudied target with minimal annotation',
  },
};
