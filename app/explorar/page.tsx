import type { Metadata } from "next";
import { ArchiveExplorer } from "../components/ArchiveExplorer";
import { PageHero } from "../components/PageHero";
import { searchCorpus } from "../server-search";

export const metadata: Metadata = { title: "Explorar el archivo", description: "Busque y filtre el corpus depurado de literatura tradicional colombiana por palabra, macro tipo, género, región y departamento.", alternates: { canonical: "/explorar" } };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string, fallback: string) => typeof params[key] === "string" ? params[key] as string : fallback;
  const initial = { query: value("q", ""), region: value("region", "todas"), genre: value("genero", "todos"), macroType: value("tipo", "todos"), department: value("departamento", "todos") };
  const initialResult = searchCorpus({ ...initial, page: 1 });
  return <main><PageHero eyebrow="Corpus documentado" title="Explorar las colecciones" summary="Busque entre miles de registros de narrativa y lírica tradicional por título, fuente, territorio, recolector y forma literaria." crumb="Explorar" /><section className="inner-section explorer-section"><ArchiveExplorer initial={initial} initialResult={initialResult} /></section></main>;
}
