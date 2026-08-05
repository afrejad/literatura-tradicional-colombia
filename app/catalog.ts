import { researchStats } from "./research-data";
import regionalizationJson from "./regionalization.json";

const regionCount = (name: string) => researchStats.corpus.regions.find((item) => item.value === name)?.count ?? 0;
const genreCount = (name: string) => researchStats.corpus.genres.find((item) => item.value === name)?.count ?? 0;

export type RegionDefinition = typeof regionalizationJson.regions[number] & { count: number };

export const regionSystem = regionalizationJson.method;
export const regions: RegionDefinition[] = regionalizationJson.regions.map((region) => ({
  ...region,
  count: regionCount(region.name),
}));
export const interregionalCoverage = {
  name: regionalizationJson.method.interregionalLabel,
  slug: "varias-regiones",
  count: regionCount(regionalizationJson.method.interregionalLabel),
};

export const genres = [
  { slug: "mitos", name: "Mitos", description: "Relatos que modelizan relaciones entre comunidad, seres, tiempo y territorio.", count: genreCount("Mito") },
  { slug: "leyendas", name: "Leyendas", description: "Narraciones ligadas a lugares, memorias y experiencias consideradas posibles.", count: genreCount("Leyenda") },
  { slug: "cuentos", name: "Cuentos tradicionales", description: "Tramas recreadas en variantes que circulan entre generaciones y regiones.", count: genreCount("Cuento") },
  { slug: "romances", name: "Romances", description: "Poemas narrativos de transmisión oral y larga circulación transatlántica.", count: genreCount("Romance") },
  { slug: "coplas", name: "Coplas", description: "Estrofas breves para cantar, improvisar, recordar y comentar la vida colectiva.", count: genreCount("Copla") },
  { slug: "decimas", name: "Décimas", description: "Poética oral de diez versos, cultivada especialmente en ámbitos rurales y costeros.", count: genreCount("Décima") },
];
