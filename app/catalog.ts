import { researchStats } from "./research-data";

const regionCount = (name: string) => researchStats.corpus.regions.find((item) => item.value === name)?.count ?? 0;
const genreCount = (name: string) => researchStats.corpus.genres.find((item) => item.value === name)?.count ?? 0;

export const regions = [
  { slug: "andina", name: "Andina", note: "Montañas, altiplanos y valles interandinos", count: regionCount("Andina") },
  { slug: "caribe", name: "Caribe", note: "Riberas, sabanas, ciénagas y litoral", count: regionCount("Caribe") },
  { slug: "pacifica", name: "Pacífica", note: "Selva húmeda, ríos y comunidades costeras", count: regionCount("Pacífica") },
  { slug: "orinoquia", name: "Orinoquía", note: "Llanuras, hatos, caminos y grandes ríos", count: regionCount("Orinoquía") },
  { slug: "amazonia", name: "Amazonía", note: "Bosques, aguas y territorios ancestrales", count: regionCount("Amazonía") },
  { slug: "insular", name: "Insular", note: "Islas, maritorios y memoria creole", count: regionCount("Insular") },
];

export const genres = [
  { slug: "mitos", name: "Mitos", description: "Relatos que modelizan relaciones entre comunidad, seres, tiempo y territorio.", count: genreCount("Mito") },
  { slug: "leyendas", name: "Leyendas", description: "Narraciones ligadas a lugares, memorias y experiencias consideradas posibles.", count: genreCount("Leyenda") },
  { slug: "cuentos", name: "Cuentos tradicionales", description: "Tramas recreadas en variantes que circulan entre generaciones y regiones.", count: genreCount("Cuento") },
  { slug: "romances", name: "Romances", description: "Poemas narrativos de transmisión oral y larga circulación transatlántica.", count: genreCount("Romance") },
  { slug: "coplas", name: "Coplas", description: "Estrofas breves para cantar, improvisar, recordar y comentar la vida colectiva.", count: genreCount("Copla") },
  { slug: "decimas", name: "Décimas", description: "Poética oral de diez versos, cultivada especialmente en ámbitos rurales y costeros.", count: genreCount("Décima") },
];

