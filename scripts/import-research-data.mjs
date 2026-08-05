import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import XLSX from "xlsx";
import { classifyRegion, validateRegionAssignments } from "./regionalization.mjs";

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));

if (!args.corpus) {
  console.error("Uso: npm run data:import -- --corpus /ruta/corpus.xlsx [--bibliografia /ruta/bibliografia.xlsx]");
  process.exit(1);
}

const corpusRows = await readWorksheet(args.corpus, "Corpus_maestro");
const bibliographyRows = args.bibliografia ? await readWorksheet(args.bibliografia, "Bibliografia_maestra") : null;
const rawByCode = args.lirica && args.narrativa
  ? new Map([
      ...(await readCsv(args.lirica)),
      ...(await readCsv(args.narrativa)),
    ].map((row) => [clean(row["Código"]), row]))
  : new Map();

validateColumns(corpusRows, ["Corpus Id", "Slug", "Titulo", "Macro Tipo", "Obra Texto", "Publicacion Web Sugerida"], "Corpus_maestro");
if (bibliographyRows) validateColumns(bibliographyRows, ["Bib Id", "Slug", "Tipo", "Autor", "Titulo"], "Bibliografia_maestra");

const regionalizedRows = corpusRows.map((row) => ({
  id: clean(row["Corpus Id"]),
  department: clean(rawByCode.get(clean(row["Codigo Original"]))?.Departamento ?? row["Departamento Normalizado"]),
  locality: clean(rawByCode.get(clean(row["Codigo Original"]))?.["Municipio de recolección"] ?? row["Municipio O Localidad Normalizado"]),
  regionalization: classifyRegion({
    department: rawByCode.get(clean(row["Codigo Original"]))?.Departamento ?? row["Departamento Normalizado"],
    locality: rawByCode.get(clean(row["Codigo Original"]))?.["Municipio de recolección"] ?? row["Municipio O Localidad Normalizado"],
  }),
}));
validateRegionAssignments(regionalizedRows);
for (const [index, item] of regionalizedRows.entries()) {
  const recordedRegion = clean(corpusRows[index].Region);
  if (recordedRegion && recordedRegion !== item.regionalization.region) {
    throw new Error(`${item.id}: la región registrada (${recordedRegion || "∅"}) no coincide con la regla territorial (${item.regionalization.region})`);
  }
}

const excludedCorpus = [];
const publishableCorpus = corpusRows.map(toCorpusRecord);
const bibliography = bibliographyRows
  ? bibliographyRows.map(toBibliographyRecord)
  : JSON.parse(await fs.readFile(path.join(root, "app", "generated", "bibliography-index.json"), "utf8"));

assertUnique(publishableCorpus, "id", "corpus_id");
assertUnique(publishableCorpus, "slug", "slug del corpus");
assertUnique(bibliography, "id", "bib_id");
assertUnique(bibliography, "slug", "slug bibliográfico");

const corpusIndexKeys = ["id", "slug", "title", "macroType", "macroTypeSlug", "genre", "genreSlug", "genreOriginal", "year", "locality", "department", "departmentSlug", "region", "regionSlug", "collector", "sourceType", "sourceBibId", "sourceAuthor", "sourceTitle", "sourceYear", "summary", "art", "searchText"];
const corpusIndex = publishableCorpus.map((record) => Object.fromEntries(corpusIndexKeys.map((key) => [key, record[key]])));
const bibliographyIndex = bibliography.map((record) => ({ ...record }));
const stats = buildStats(corpusRows.length, publishableCorpus, excludedCorpus.length, bibliography);

await fs.mkdir(path.join(root, "app", "generated"), { recursive: true });
await fs.mkdir(path.join(root, "public", "data"), { recursive: true });

await Promise.all([
  writeJson("app/generated/corpus-index.json", corpusIndex),
  writeJson("app/generated/corpus-records.json", publishableCorpus),
  writeJson("app/generated/bibliography-index.json", bibliographyIndex),
  writeJson("app/generated/stats.json", stats),
  fs.writeFile(path.join(root, "public", "data", "corpus-metadata.csv"), corpusCsv(publishableCorpus), "utf8"),
  fs.writeFile(path.join(root, "public", "data", "bibliografia.csv"), bibliographyCsv(bibliography), "utf8"),
]);

console.log(JSON.stringify({
  corpusSource: corpusRows.length,
  corpusPublishedMetadata: publishableCorpus.length,
  corpusExcluded: excludedCorpus.length,
  corpusTextsPublished: publishableCorpus.filter((record) => record.text).length,
  bibliography: bibliography.length,
  output: ["app/generated", "public/data"],
}, null, 2));

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === "--corpus") parsed.corpus = values[index + 1];
    if (values[index] === "--bibliografia") parsed.bibliografia = values[index + 1];
    if (values[index] === "--lirica") parsed.lirica = values[index + 1];
    if (values[index] === "--narrativa") parsed.narrativa = values[index + 1];
  }
  return parsed;
}

async function readCsv(filePath) {
  const input = (await fs.readFile(path.resolve(filePath), "utf8")).replace(/^\uFEFF/, "");
  const matrix = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      matrix.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    matrix.push(row);
  }
  const headers = matrix[0];
  return matrix.slice(1).filter((values) => values.some((value) => value !== "")).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

async function readWorksheet(filePath, sheetName) {
  const workbook = XLSX.readFile(path.resolve(filePath), { cellDates: true });
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`No se encontró la hoja ${sheetName} en ${filePath}`);
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
  const headers = (matrix[0] ?? []).map(cellText);
  const rows = matrix.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, cellText(row[index])]))).filter((row) => Object.values(row).some((value) => value !== ""));
  Object.defineProperty(rows, "headers", { value: headers });
  return rows;
}

function cellText(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("result" in value) return cellText(value.result);
    if ("richText" in value) return value.richText.map((item) => item.text).join("");
    if ("text" in value) return String(value.text ?? "");
  }
  return String(value).trim();
}

function validateColumns(rows, required, sheetName) {
  const headers = rows.headers ?? [];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`${sheetName}: faltan columnas requeridas: ${missing.join(", ")}`);
}

function clean(value) {
  return String(value ?? "").trim();
}

function nullable(value) {
  const text = clean(value);
  return text === "" || text === "-" ? null : text;
}

function corpusText(value) {
  const text = String(value ?? "").replace(/\r\n?/g, "\n");
  return text.trim() ? text : null;
}

function slugify(value) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "sin-dato";
}

function normalizeSearch(parts) {
  return parts
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/\s+/g, " ")
    .trim();
}

function knownGenreSlug(genre) {
  const known = new Map([
    ["Mito", "mitos"],
    ["Leyenda", "leyendas"],
    ["Cuento", "cuentos"],
    ["Romance", "romances"],
    ["Copla", "coplas"],
    ["Décima", "decimas"],
  ]);
  return known.get(genre) ?? slugify(genre);
}

function artFor(id, genre, region) {
  const styles = ["forest", "river", "coast", "plain", "mountain", "weave"];
  const seed = `${id}-${genre}-${region}`;
  let hash = 0;
  for (const character of seed) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return styles[Math.abs(hash) % styles.length];
}

function toCorpusRecord(row) {
  const id = clean(row["Corpus Id"]);
  const raw = rawByCode.get(clean(row["Codigo Original"]));
  const title = clean(raw?.["TÍTULO"] ?? row.Titulo) || "Registro sin título";
  const macroType = clean(raw?.["Tipo de obra"] ?? row["Macro Tipo"]) || "Sin clasificación";
  const genre = clean(row["Genero Forma Filtro"]) || "Sin clasificación";
  const rawDepartment = clean(raw?.Departamento ?? row["Departamento Normalizado"]);
  const department = rawDepartment || "Sin dato";
  const locality = nullable(raw?.["Municipio de recolección"] ?? row["Municipio O Localidad Normalizado"]);
  const regionalization = classifyRegion({ department: rawDepartment, locality });
  const region = clean(row.Region) || regionalization.region;
  if (region !== regionalization.region) throw new Error(`${id}: región no reproducible desde la localización`);
  const year = nullable(raw?.["Año de recolección"] ?? row["Ano Recoleccion"]);
  const collector = nullable(raw?.["Recolector de la obra"] ?? row.Recolector);
  const sourceAuthor = nullable(row["Fuente Autor"]);
  const sourceTitle = nullable(row["Fuente Titulo"]);
  const sourceYear = nullable(row["Fuente Ano"]);
  const sourceType = nullable(row["Tipo Fuente"]);
  const sourceBibId = nullable(row["Fuente Bib Id"]);
  const location = [locality, department !== "Sin dato" ? department : null].filter(Boolean).join(", ") || "localización por precisar";
  const narrative = macroType === "Narrativa";
  const summary = `${narrative ? "Relato" : "Pieza lírica"} ${narrative ? "clasificado" : "clasificada"} como ${genre.toLocaleLowerCase("es")}, ${narrative ? "documentado" : "documentada"} en ${location}${year ? ` en ${year}` : ""}.`;
  const slug = clean(row.Slug) || `${slugify(title)}-${slugify(id)}`;

  return {
    id,
    slug,
    title,
    macroType,
    macroTypeSlug: slugify(macroType),
    genre,
    genreSlug: knownGenreSlug(genre),
    genreOriginal: nullable(raw?.["Tipo de obra lírica"] || raw?.["Tipo de obra narrativa"] || row["Genero Forma Original"]),
    year,
    locality,
    department,
    departmentSlug: slugify(department),
    region,
    regionSlug: regionalization.regionSlug,
    regionCriterion: clean(row["Criterio Regionalizacion"]) || regionalization.criterion,
    specialZones: (clean(row["Zonas Especiales Regionales"]) || regionalization.specialZones.join("; ")).split(";").map((value) => value.trim()).filter(Boolean),
    collector,
    sourceType,
    sourceBibId,
    sourceAuthor,
    sourceTitle,
    sourceYear,
    sourceUrl: nullable(row["Fuente Url"]),
    text: corpusText(raw?.["LA OBRA"] ?? row["Obra Texto"]),
    project: nullable(raw?.["Proyecto trabajo de campo"] ?? row.Proyecto),
    metadataStatus: nullable(row["Estado Metadatos"]),
    rightsStatus: "Publicable: consentimiento o dominio público confirmado por el investigador",
    privacyStatus: "Apta para publicación según confirmación del investigador",
    publicationStatus: "Publicar texto y metadatos",
    qualityAlerts: nullable(row["Alertas Calidad"]),
    summary,
    art: artFor(id, genre, region),
    searchText: normalizeSearch([id, title, macroType, genre, row["Genero Forma Original"], year, locality, department, region, regionalization.specialZones.join(" "), collector, sourceAuthor, sourceTitle, sourceYear, row.Proyecto]),
  };
}

function toBibliographyRecord(row) {
  const id = clean(row["Bib Id"]);
  const title = clean(row.Titulo) || "Referencia sin título";
  const author = clean(row.Autor) || "Autor no identificado";
  const year = nullable(row.Ano);
  const publication = nullable(row["Revista O Editorial"]) || nullable(row.Revista) || nullable(row.Editorial);
  const slug = clean(row.Slug) || `${slugify(title)}-${slugify(id)}`;
  const type = clean(row.Tipo) || "Sin clasificación";
  const doi = nullable(row.Doi);
  const url = nullable(row.Url);
  const citation = [
    `${author}. (${year || "s. f."}). ${title}.`,
    publication ? `${publication}.` : null,
    doi ? `https://doi.org/${doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")}` : url,
  ].filter(Boolean).join(" ");

  return {
    id,
    slug,
    type,
    typeSlug: slugify(type),
    author,
    year,
    title,
    publication,
    volume: nullable(row.Volumen),
    issue: nullable(row.Numero),
    pages: nullable(row.Paginas),
    city: nullable(row.Ciudad),
    doi,
    url,
    isbn: nullable(row.Isbn),
    issn: nullable(row.Issn),
    coverage: nullable(row["Cobertura Geografica"]),
    topics: nullable(row.Temas),
    language: nullable(row.Idioma),
    verificationStatus: nullable(row["Estado Verificacion"]),
    notes: nullable(row.Notas),
    citation,
    searchText: normalizeSearch([id, type, author, year, title, publication, row.Ciudad, row.Doi, row.Isbn, row.Issn, row["Cobertura Geografica"], row.Temas, row.Idioma]),
  };
}

function assertUnique(rows, key, label) {
  const seen = new Set();
  const duplicates = new Set();
  for (const row of rows) {
    const value = row[key];
    if (!value) throw new Error(`Registro sin ${label}`);
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  if (duplicates.size) throw new Error(`Valores duplicados en ${label}: ${[...duplicates].slice(0, 12).join(", ")}`);
}

function countBy(rows, key, slugKey) {
  const counts = new Map();
  for (const row of rows) {
    const value = row[key] || "Sin dato";
    const current = counts.get(value) ?? { count: 0, slug: row[slugKey] || slugify(value) };
    current.count += 1;
    counts.set(value, current);
  }
  return [...counts.entries()].sort((a, b) => b[1].count - a[1].count).map(([value, item]) => ({ value, slug: item.slug, count: item.count }));
}

function buildStats(sourceCorpusTotal, corpus, excluded, bibliographyRows) {
  return {
    generatedAt: new Date().toISOString(),
    corpus: {
      sourceTotal: sourceCorpusTotal,
      publishedMetadata: corpus.length,
      excludedPendingReview: excluded,
      publishedTexts: corpus.filter((record) => record.text).length,
      macroTypes: countBy(corpus, "macroType", "macroTypeSlug"),
      genres: countBy(corpus, "genre", "genreSlug"),
      regions: countBy(corpus, "region", "regionSlug"),
      departments: countBy(corpus, "department", "departmentSlug"),
    },
    bibliography: {
      total: bibliographyRows.length,
      types: countBy(bibliographyRows, "type", "typeSlug"),
      verification: countBy(bibliographyRows, "verificationStatus"),
    },
  };
}

async function writeJson(relativePath, value) {
  await fs.writeFile(path.join(root, relativePath), `${JSON.stringify(value)}\n`, "utf8");
}

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows, columns) {
  const header = columns.map(([label]) => label);
  const lines = [header.map(csvCell).join(",")];
  for (const row of rows) lines.push(columns.map(([, key]) => csvCell(row[key])).join(","));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

function corpusCsv(rows) {
  return toCsv(rows, [
    ["Corpus ID", "id"], ["Slug", "slug"], ["Título", "title"], ["Macro tipo", "macroType"], ["Género", "genre"],
    ["Año de recolección", "year"], ["Municipio o localidad", "locality"], ["Departamento", "department"], ["Región", "region"],
    ["Criterio de regionalización", "regionCriterion"], ["Zonas especiales regionales", "specialZones"],
    ["Recolector", "collector"], ["Tipo de fuente", "sourceType"], ["Fuente bibliográfica ID", "sourceBibId"], ["Autor de la fuente", "sourceAuthor"],
    ["Título de la fuente", "sourceTitle"], ["Año de la fuente", "sourceYear"], ["URL de la fuente", "sourceUrl"], ["Estado de derechos", "rightsStatus"],
    ["Estado de privacidad", "privacyStatus"], ["Estado de publicación", "publicationStatus"], ["Alertas de calidad", "qualityAlerts"],
  ]);
}

function bibliographyCsv(rows) {
  return toCsv(rows, [
    ["Bib ID", "id"], ["Tipo", "type"], ["Autor", "author"], ["Año", "year"], ["Título", "title"], ["Revista o editorial", "publication"],
    ["Volumen", "volume"], ["Número", "issue"], ["Páginas", "pages"], ["Ciudad", "city"], ["DOI", "doi"], ["URL", "url"], ["ISBN", "isbn"],
    ["ISSN", "issn"], ["Cobertura geográfica", "coverage"], ["Temas", "topics"], ["Idioma", "language"], ["Estado de verificación", "verificationStatus"],
    ["Notas", "notes"], ["Cita sugerida", "citation"],
  ]);
}
