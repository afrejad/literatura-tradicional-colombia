import bibliographyJson from "./generated/bibliography-index.json";
import corpusIndexJson from "./generated/corpus-index.json";
import corpusRecordsJson from "./generated/corpus-records.json";
import statsJson from "./generated/stats.json";

export type CorpusIndexItem = {
  id: string;
  slug: string;
  title: string;
  macroType: string;
  macroTypeSlug: string;
  genre: string;
  genreSlug: string;
  genreOriginal: string | null;
  year: string | null;
  locality: string | null;
  department: string;
  departmentSlug: string;
  region: string;
  regionSlug: string;
  collector: string | null;
  sourceType: string | null;
  sourceBibId: string | null;
  sourceAuthor: string | null;
  sourceTitle: string | null;
  sourceYear: string | null;
  summary: string;
  art: string;
  searchText: string;
};

export type CorpusRecord = CorpusIndexItem & {
  sourceUrl: string | null;
  text: string | null;
  project: string | null;
  metadataStatus: string | null;
  rightsStatus: string | null;
  privacyStatus: string | null;
  publicationStatus: string | null;
  qualityAlerts: string | null;
};

export type BibliographyItem = {
  id: string;
  slug: string;
  type: string;
  typeSlug: string;
  author: string;
  year: string | null;
  title: string;
  publication: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  city: string | null;
  doi: string | null;
  url: string | null;
  isbn: string | null;
  issn: string | null;
  coverage: string | null;
  topics: string | null;
  language: string | null;
  verificationStatus: string | null;
  notes: string | null;
  citation: string;
  searchText: string;
};

export type Facet = { value: string; slug: string; count: number };
export type ResearchStats = {
  generatedAt: string;
  corpus: {
    sourceTotal: number;
    publishedMetadata: number;
    excludedPendingReview: number;
    publishedTexts: number;
    macroTypes: Facet[];
    genres: Facet[];
    regions: Facet[];
    departments: Facet[];
  };
  bibliography: { total: number; types: Facet[]; verification: Facet[] };
};

export const corpusIndex = corpusIndexJson as CorpusIndexItem[];
export const corpusRecords = corpusRecordsJson as CorpusRecord[];
export const bibliography = bibliographyJson as BibliographyItem[];
export const researchStats = statsJson as ResearchStats;

export function findCorpusRecord(slug: string) {
  return corpusRecords.find((record) => record.slug === slug);
}
