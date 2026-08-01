import type { Metadata } from "next";
import { BibliographyExplorer } from "../components/BibliographyExplorer";
import { PageHero } from "../components/PageHero";
import { researchStats } from "../research-data";
import { searchBibliography } from "../server-search";

export const metadata: Metadata = { title: "Biblioteca bibliográfica", description: "Bibliografía histórica y especializada sobre literatura tradicional colombiana.", alternates: { canonical: "/biblioteca" } };

export default async function LibraryPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const params=await searchParams;const query=typeof params.q==="string"?params.q:"";const type=typeof params.tipo==="string"?params.tipo:"todos";const initialResult=searchBibliography({query,type,order:"antiguos",page:1});return <main><PageHero eyebrow="Fuentes y estudios" title="Biblioteca bibliográfica" summary={`Consulte ${researchStats.bibliography.total.toLocaleString("es-CO")} libros y artículos de distintas épocas sobre las literaturas tradicionales de Colombia.`} crumb="Biblioteca"/><section className="inner-section"><div className="notice"><strong>Base documental activa</strong><p>La bibliografía depurada ya puede buscarse, filtrarse, citarse y descargarse. Los registros distinguen su estado de verificación para no presentar como completos datos que todavía requieren cotejo.</p></div><BibliographyExplorer initial={{query,type}} initialResult={initialResult}/></section></main>}
