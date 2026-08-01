import { bibliography, corpusIndex, type BibliographyItem, type CorpusIndexItem } from "./research-data";

export type CorpusFilters = { query: string; region: string; genre: string; macroType: string; department: string; page: number };
export type BibliographyFilters = { query: string; type: string; order: string; page: number };
export type Paginated<T> = { items: T[]; total: number; page: number; pageCount: number };

const CORPUS_PAGE_SIZE = 24;
const BIBLIOGRAPHY_PAGE_SIZE = 25;

export function searchCorpus(filters: CorpusFilters): Paginated<CorpusIndexItem> {
  const needle = normalizeQuery(filters.query);
  const matched = corpusIndex.filter((record) =>
    (!needle || record.searchText.includes(needle)) &&
    (filters.region === "todas" || record.regionSlug === filters.region) &&
    (filters.genre === "todos" || record.genreSlug === filters.genre) &&
    (filters.macroType === "todos" || record.macroTypeSlug === filters.macroType) &&
    (filters.department === "todos" || record.departmentSlug === filters.department),
  );
  return paginate(matched, filters.page, CORPUS_PAGE_SIZE);
}

export function searchBibliography(filters: BibliographyFilters): Paginated<BibliographyItem> {
  const needle = normalizeQuery(filters.query);
  const matched = bibliography
    .filter((item) => (!needle || item.searchText.includes(needle)) && (filters.type === "todos" || item.typeSlug === filters.type))
    .sort((a, b) => compareBibliography(a, b, filters.order));
  return paginate(matched, filters.page, BIBLIOGRAPHY_PAGE_SIZE);
}

function paginate<T>(rows: T[], requestedPage: number, pageSize: number): Paginated<T> {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  return { items: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageCount };
}

function normalizeQuery(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").replace(/\s+/g, " ").trim();
}

function compareBibliography(a: BibliographyItem, b: BibliographyItem, order: string) {
  if (order === "autor") return a.author.localeCompare(b.author, "es");
  const yearA = Number.parseInt(a.year || "", 10);
  const yearB = Number.parseInt(b.year || "", 10);
  const safeA = Number.isFinite(yearA) ? yearA : order === "recientes" ? -1 : 9999;
  const safeB = Number.isFinite(yearB) ? yearB : order === "recientes" ? -1 : 9999;
  return order === "recientes" ? safeB - safeA : safeA - safeB;
}

