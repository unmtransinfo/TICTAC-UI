import type { DiseaseTargetAssociation, Disease, Gene, Evidence, TDL, ReferenceType } from '@/types/tictac';

// Helper to generate realistic evidence
const generateEvidence = (
  geneSymbol: string,
  diseaseName: string,
  count: number
): Evidence[] => {
  const journals = [
    'Nature Medicine',
    'The Lancet',
    'New England Journal of Medicine',
    'JAMA',
    'Cell',
    'Science Translational Medicine',
    'Clinical Cancer Research',
    'Diabetes Care',
    'Journal of Clinical Oncology',
    'Circulation',
  ];

  const refTypes: ReferenceType[] = ['RESULT', 'BACKGROUND', 'DERIVED'];

  return Array.from({ length: count }, (_, i) => {
    const year = 2018 + Math.floor(Math.random() * 6);
    const nctNum = String(10000000 + Math.floor(Math.random() * 90000000)).padStart(8, '0');
    const pmidNum = String(30000000 + Math.floor(Math.random() * 8000000));
    const refType = refTypes[Math.min(Math.floor(Math.random() * 3), 2)];

    return {
      id: `ev-${geneSymbol}-${i}`,
      nctId: `NCT${nctNum}`,
      pmid: Math.random() > 0.2 ? pmidNum : undefined,
      title: `${refType === 'RESULT' ? 'Efficacy of' : refType === 'BACKGROUND' ? 'Role of' : 'Analysis of'} ${geneSymbol} ${refType === 'RESULT' ? 'inhibition' : 'modulation'} in ${diseaseName}: A ${refType === 'RESULT' ? 'Phase III' : 'systematic'} study`,
      authors: `Smith J, Johnson M, Williams K, et al.`,
      journal: journals[Math.floor(Math.random() * journals.length)],
      year,
      referenceType: refType,
    };
  });
};

// Type 2 Diabetes associations (from paper examples)
const diabetesAssociations: DiseaseTargetAssociation[] = [
  {
    id: 'dta-1',
    geneSymbol: 'MC4R',
    geneName: 'Melanocortin 4 Receptor',
    uniprotId: 'P32245',
    diseaseName: 'Type 2 Diabetes Mellitus',
    diseaseId: 'DOID:9352',
    tdl: 'Tclin',
    meanRankScore: 87.5,
    nPub: 234,
    nStud: 45,
    nDrug: 3,
    studyNewness: 0.82,
    evidence: generateEvidence('MC4R', 'Type 2 Diabetes', 12),
  },
  {
    id: 'dta-2',
    geneSymbol: 'GLP1R',
    geneName: 'Glucagon Like Peptide 1 Receptor',
    uniprotId: 'P43220',
    diseaseName: 'Type 2 Diabetes Mellitus',
    diseaseId: 'DOID:9352',
    tdl: 'Tclin',
    meanRankScore: 92.3,
    nPub: 456,
    nStud: 89,
    nDrug: 8,
    studyNewness: 0.95,
    evidence: generateEvidence('GLP1R', 'Type 2 Diabetes', 18),
  },
  {
    id: 'dta-3',
    geneSymbol: 'DPP4',
    geneName: 'Dipeptidyl Peptidase 4',
    uniprotId: 'P27487',
    diseaseName: 'Type 2 Diabetes Mellitus',
    diseaseId: 'DOID:9352',
    tdl: 'Tclin',
    meanRankScore: 89.1,
    nPub: 389,
    nStud: 72,
    nDrug: 6,
    studyNewness: 0.88,
    evidence: generateEvidence('DPP4', 'Type 2 Diabetes', 15),
  },
  {
    id: 'dta-4',
    geneSymbol: 'SGLT2',
    geneName: 'Sodium-Glucose Cotransporter 2',
    uniprotId: 'P31639',
    diseaseName: 'Type 2 Diabetes Mellitus',
    diseaseId: 'DOID:9352',
    tdl: 'Tclin',
    meanRankScore: 91.7,
    nPub: 412,
    nStud: 85,
    nDrug: 5,
    studyNewness: 0.91,
    evidence: generateEvidence('SGLT2', 'Type 2 Diabetes', 16),
  },
  {
    id: 'dta-5',
    geneSymbol: 'PPARG',
    geneName: 'Peroxisome Proliferator Activated Receptor Gamma',
    uniprotId: 'P37231',
    diseaseName: 'Type 2 Diabetes Mellitus',
    diseaseId: 'DOID:9352',
    tdl: 'Tclin',
    meanRankScore: 78.4,
    nPub: 567,
    nStud: 98,
    nDrug: 4,
    studyNewness: 0.65,
    evidence: generateEvidence('PPARG', 'Type 2 Diabetes', 14),
  },
  {
    id: 'dta-6',
    geneSymbol: 'KCNJ11',
    geneName: 'Potassium Inwardly Rectifying Channel J11',
    uniprotId: 'Q14654',
    diseaseName: 'Type 2 Diabetes Mellitus',
    diseaseId: 'DOID:9352',
    tdl: 'Tchem',
    meanRankScore: 72.8,
    nPub: 189,
    nStud: 34,
    nDrug: 2,
    studyNewness: 0.71,
    evidence: generateEvidence('KCNJ11', 'Type 2 Diabetes', 9),
  },
  {
    id: 'dta-7',
    geneSymbol: 'TCF7L2',
    geneName: 'Transcription Factor 7 Like 2',
    uniprotId: 'Q9NQB0',
    diseaseName: 'Type 2 Diabetes Mellitus',
    diseaseId: 'DOID:9352',
    tdl: 'Tbio',
    meanRankScore: 65.2,
    nPub: 312,
    nStud: 56,
    nDrug: 0,
    studyNewness: 0.78,
    evidence: generateEvidence('TCF7L2', 'Type 2 Diabetes', 8),
  },
  {
    id: 'dta-8',
    geneSymbol: 'MTNR1B',
    geneName: 'Melatonin Receptor 1B',
    uniprotId: 'P49286',
    diseaseName: 'Type 2 Diabetes Mellitus',
    diseaseId: 'DOID:9352',
    tdl: 'Tdark',
    meanRankScore: 45.3,
    nPub: 78,
    nStud: 12,
    nDrug: 0,
    studyNewness: 0.55,
    evidence: generateEvidence('MTNR1B', 'Type 2 Diabetes', 5),
  },
];

// Lung Cancer associations
const lungCancerAssociations: DiseaseTargetAssociation[] = [
  {
    id: 'dta-9',
    geneSymbol: 'EGFR',
    geneName: 'Epidermal Growth Factor Receptor',
    uniprotId: 'P00533',
    diseaseName: 'Non-Small Cell Lung Carcinoma',
    diseaseId: 'DOID:3908',
    tdl: 'Tclin',
    meanRankScore: 95.2,
    nPub: 892,
    nStud: 156,
    nDrug: 12,
    studyNewness: 0.92,
    evidence: generateEvidence('EGFR', 'Lung Cancer', 20),
  },
  {
    id: 'dta-10',
    geneSymbol: 'ALK',
    geneName: 'ALK Receptor Tyrosine Kinase',
    uniprotId: 'Q9UM73',
    diseaseName: 'Non-Small Cell Lung Carcinoma',
    diseaseId: 'DOID:3908',
    tdl: 'Tclin',
    meanRankScore: 88.7,
    nPub: 534,
    nStud: 89,
    nDrug: 7,
    studyNewness: 0.89,
    evidence: generateEvidence('ALK', 'Lung Cancer', 16),
  },
  {
    id: 'dta-11',
    geneSymbol: 'KRAS',
    geneName: 'KRAS Proto-Oncogene',
    uniprotId: 'P01116',
    diseaseName: 'Non-Small Cell Lung Carcinoma',
    diseaseId: 'DOID:3908',
    tdl: 'Tclin',
    meanRankScore: 82.4,
    nPub: 678,
    nStud: 112,
    nDrug: 3,
    studyNewness: 0.96,
    evidence: generateEvidence('KRAS', 'Lung Cancer', 14),
  },
  {
    id: 'dta-12',
    geneSymbol: 'ROS1',
    geneName: 'ROS Proto-Oncogene 1',
    uniprotId: 'P08922',
    diseaseName: 'Non-Small Cell Lung Carcinoma',
    diseaseId: 'DOID:3908',
    tdl: 'Tclin',
    meanRankScore: 79.8,
    nPub: 234,
    nStud: 45,
    nDrug: 4,
    studyNewness: 0.87,
    evidence: generateEvidence('ROS1', 'Lung Cancer', 10),
  },
  {
    id: 'dta-13',
    geneSymbol: 'MET',
    geneName: 'MET Proto-Oncogene',
    uniprotId: 'P08581',
    diseaseName: 'Non-Small Cell Lung Carcinoma',
    diseaseId: 'DOID:3908',
    tdl: 'Tchem',
    meanRankScore: 71.5,
    nPub: 345,
    nStud: 67,
    nDrug: 2,
    studyNewness: 0.84,
    evidence: generateEvidence('MET', 'Lung Cancer', 11),
  },
  {
    id: 'dta-14',
    geneSymbol: 'RET',
    geneName: 'Ret Proto-Oncogene',
    uniprotId: 'P07949',
    diseaseName: 'Non-Small Cell Lung Carcinoma',
    diseaseId: 'DOID:3908',
    tdl: 'Tclin',
    meanRankScore: 76.3,
    nPub: 189,
    nStud: 38,
    nDrug: 3,
    studyNewness: 0.91,
    evidence: generateEvidence('RET', 'Lung Cancer', 9),
  },
  {
    id: 'dta-15',
    geneSymbol: 'NRG1',
    geneName: 'Neuregulin 1',
    uniprotId: 'Q02297',
    diseaseName: 'Non-Small Cell Lung Carcinoma',
    diseaseId: 'DOID:3908',
    tdl: 'Tbio',
    meanRankScore: 52.1,
    nPub: 67,
    nStud: 14,
    nDrug: 0,
    studyNewness: 0.78,
    evidence: generateEvidence('NRG1', 'Lung Cancer', 6),
  },
  {
    id: 'dta-16',
    geneSymbol: 'NTRK1',
    geneName: 'Neurotrophic Receptor Tyrosine Kinase 1',
    uniprotId: 'P04629',
    diseaseName: 'Non-Small Cell Lung Carcinoma',
    diseaseId: 'DOID:3908',
    tdl: 'Tchem',
    meanRankScore: 68.9,
    nPub: 145,
    nStud: 28,
    nDrug: 2,
    studyNewness: 0.85,
    evidence: generateEvidence('NTRK1', 'Lung Cancer', 8),
  },
];

// Breast Cancer associations
const breastCancerAssociations: DiseaseTargetAssociation[] = [
  {
    id: 'dta-17',
    geneSymbol: 'ERBB2',
    geneName: 'Erb-B2 Receptor Tyrosine Kinase 2',
    uniprotId: 'P04626',
    diseaseName: 'Breast Carcinoma',
    diseaseId: 'DOID:3459',
    tdl: 'Tclin',
    meanRankScore: 94.5,
    nPub: 1234,
    nStud: 234,
    nDrug: 15,
    studyNewness: 0.88,
    evidence: generateEvidence('ERBB2', 'Breast Cancer', 22),
  },
  {
    id: 'dta-18',
    geneSymbol: 'ESR1',
    geneName: 'Estrogen Receptor 1',
    uniprotId: 'P03372',
    diseaseName: 'Breast Carcinoma',
    diseaseId: 'DOID:3459',
    tdl: 'Tclin',
    meanRankScore: 93.8,
    nPub: 1567,
    nStud: 287,
    nDrug: 12,
    studyNewness: 0.85,
    evidence: generateEvidence('ESR1', 'Breast Cancer', 20),
  },
  {
    id: 'dta-19',
    geneSymbol: 'PIK3CA',
    geneName: 'Phosphatidylinositol-4,5-Bisphosphate 3-Kinase Catalytic Subunit Alpha',
    uniprotId: 'P42336',
    diseaseName: 'Breast Carcinoma',
    diseaseId: 'DOID:3459',
    tdl: 'Tclin',
    meanRankScore: 81.2,
    nPub: 456,
    nStud: 78,
    nDrug: 4,
    studyNewness: 0.92,
    evidence: generateEvidence('PIK3CA', 'Breast Cancer', 14),
  },
  {
    id: 'dta-20',
    geneSymbol: 'CDK4',
    geneName: 'Cyclin Dependent Kinase 4',
    uniprotId: 'P11802',
    diseaseName: 'Breast Carcinoma',
    diseaseId: 'DOID:3459',
    tdl: 'Tclin',
    meanRankScore: 85.6,
    nPub: 389,
    nStud: 67,
    nDrug: 3,
    studyNewness: 0.94,
    evidence: generateEvidence('CDK4', 'Breast Cancer', 12),
  },
  {
    id: 'dta-21',
    geneSymbol: 'BRCA1',
    geneName: 'BRCA1 DNA Repair Associated',
    uniprotId: 'P38398',
    diseaseName: 'Breast Carcinoma',
    diseaseId: 'DOID:3459',
    tdl: 'Tbio',
    meanRankScore: 72.4,
    nPub: 2345,
    nStud: 345,
    nDrug: 0,
    studyNewness: 0.82,
    evidence: generateEvidence('BRCA1', 'Breast Cancer', 18),
  },
  {
    id: 'dta-22',
    geneSymbol: 'PARP1',
    geneName: 'Poly(ADP-Ribose) Polymerase 1',
    uniprotId: 'P09874',
    diseaseName: 'Breast Carcinoma',
    diseaseId: 'DOID:3459',
    tdl: 'Tclin',
    meanRankScore: 78.9,
    nPub: 567,
    nStud: 89,
    nDrug: 4,
    studyNewness: 0.91,
    evidence: generateEvidence('PARP1', 'Breast Cancer', 15),
  },
];

// Alzheimer's associations
const alzheimerAssociations: DiseaseTargetAssociation[] = [
  {
    id: 'dta-23',
    geneSymbol: 'APP',
    geneName: 'Amyloid Beta Precursor Protein',
    uniprotId: 'P05067',
    diseaseName: "Alzheimer's Disease",
    diseaseId: 'DOID:10652',
    tdl: 'Tchem',
    meanRankScore: 76.8,
    nPub: 4567,
    nStud: 234,
    nDrug: 2,
    studyNewness: 0.72,
    evidence: generateEvidence('APP', "Alzheimer's", 16),
  },
  {
    id: 'dta-24',
    geneSymbol: 'BACE1',
    geneName: 'Beta-Secretase 1',
    uniprotId: 'P56817',
    diseaseName: "Alzheimer's Disease",
    diseaseId: 'DOID:10652',
    tdl: 'Tchem',
    meanRankScore: 68.4,
    nPub: 1234,
    nStud: 89,
    nDrug: 1,
    studyNewness: 0.65,
    evidence: generateEvidence('BACE1', "Alzheimer's", 12),
  },
  {
    id: 'dta-25',
    geneSymbol: 'MAPT',
    geneName: 'Microtubule Associated Protein Tau',
    uniprotId: 'P10636',
    diseaseName: "Alzheimer's Disease",
    diseaseId: 'DOID:10652',
    tdl: 'Tbio',
    meanRankScore: 71.2,
    nPub: 3456,
    nStud: 178,
    nDrug: 0,
    studyNewness: 0.78,
    evidence: generateEvidence('MAPT', "Alzheimer's", 14),
  },
  {
    id: 'dta-26',
    geneSymbol: 'APOE',
    geneName: 'Apolipoprotein E',
    uniprotId: 'P02649',
    diseaseName: "Alzheimer's Disease",
    diseaseId: 'DOID:10652',
    tdl: 'Tbio',
    meanRankScore: 82.1,
    nPub: 5678,
    nStud: 289,
    nDrug: 0,
    studyNewness: 0.85,
    evidence: generateEvidence('APOE', "Alzheimer's", 18),
  },
  {
    id: 'dta-27',
    geneSymbol: 'TREM2',
    geneName: 'Triggering Receptor Expressed On Myeloid Cells 2',
    uniprotId: 'Q9NZC2',
    diseaseName: "Alzheimer's Disease",
    diseaseId: 'DOID:10652',
    tdl: 'Tdark',
    meanRankScore: 48.7,
    nPub: 234,
    nStud: 34,
    nDrug: 0,
    studyNewness: 0.91,
    evidence: generateEvidence('TREM2', "Alzheimer's", 7),
  },
];

// Combine all associations
export const mockAssociations: DiseaseTargetAssociation[] = [
  ...diabetesAssociations,
  ...lungCancerAssociations,
  ...breastCancerAssociations,
  ...alzheimerAssociations,
];

// Mock diseases
export const mockDiseases: Disease[] = [
  {
    id: 'disease-1',
    doid: 'DOID:9352',
    name: 'Type 2 Diabetes Mellitus',
    synonyms: ['T2DM', 'Type 2 Diabetes', 'Adult-Onset Diabetes'],
    associationCount: diabetesAssociations.length,
  },
  {
    id: 'disease-2',
    doid: 'DOID:3908',
    name: 'Non-Small Cell Lung Carcinoma',
    synonyms: ['NSCLC', 'Non-Small Cell Lung Cancer'],
    associationCount: lungCancerAssociations.length,
  },
  {
    id: 'disease-3',
    doid: 'DOID:3459',
    name: 'Breast Carcinoma',
    synonyms: ['Breast Cancer', 'Mammary Carcinoma'],
    associationCount: breastCancerAssociations.length,
  },
  {
    id: 'disease-4',
    doid: 'DOID:10652',
    name: "Alzheimer's Disease",
    synonyms: ["Alzheimer's", 'AD', 'Senile Dementia'],
    associationCount: alzheimerAssociations.length,
  },
];

// Mock genes (extracted from associations)
export const mockGenes: Gene[] = mockAssociations
  .reduce((acc, assoc) => {
    const existing = acc.find((g) => g.symbol === assoc.geneSymbol);
    if (!existing) {
      acc.push({
        symbol: assoc.geneSymbol,
        name: assoc.geneName,
        uniprotId: assoc.uniprotId,
        tdl: assoc.tdl,
        associationCount: 1,
      });
    } else {
      existing.associationCount++;
    }
    return acc;
  }, [] as Gene[])
  .sort((a, b) => b.associationCount - a.associationCount);

// Helper functions
export const getAssociationsByDisease = (diseaseId: string): DiseaseTargetAssociation[] => {
  return mockAssociations.filter((a) => a.diseaseId === diseaseId);
};

export const getAssociationsByGene = (geneSymbol: string): DiseaseTargetAssociation[] => {
  return mockAssociations.filter((a) => a.geneSymbol === geneSymbol);
};

export const getAssociationById = (id: string): DiseaseTargetAssociation | undefined => {
  return mockAssociations.find((a) => a.id === id);
};

export const searchDiseases = (query: string): Disease[] => {
  const lowerQuery = query.toLowerCase();
  return mockDiseases.filter(
    (d) =>
      d.name.toLowerCase().includes(lowerQuery) ||
      d.doid.toLowerCase().includes(lowerQuery) ||
      d.synonyms.some((s) => s.toLowerCase().includes(lowerQuery))
  );
};

export const searchGenes = (query: string): Gene[] => {
  const lowerQuery = query.toLowerCase();
  return mockGenes.filter(
    (g) =>
      g.symbol.toLowerCase().includes(lowerQuery) ||
      g.name.toLowerCase().includes(lowerQuery)
  );
};

// Statistics for landing page
export const platformStats = {
  clinicalTrials: '507,000+',
  geneTargets: '2,000+',
  diseases: '2,200+',
  publications: '1.2M+',
};
