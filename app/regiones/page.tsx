import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "../components/PageHero";
import { regions } from "../catalog";

export const metadata: Metadata = { title: "Regiones de Colombia", description: "Explore las literaturas tradicionales de Colombia desde sus regiones y territorios.", alternates: { canonical: "/regiones" } };

export default function RegionsPage() {
  return <main><PageHero eyebrow="Cartografía oral" title="Regiones de Colombia" summary="El territorio no es un contenedor neutro: interviene en las imágenes, recorridos, conflictos y memorias que cada tradición pone en circulación." crumb="Regiones" /><section className="inner-section"><div className="atlas-intro"><span>Seis recorridos</span><p>Esta división regional funciona como puerta de entrada y dialoga con filtros departamentales, municipales y con categorías provisionales que todavía requieren precisión geográfica.</p></div><div className="region-catalog">{regions.map((region,index)=><Link className="region-panel" href={`/explorar?region=${region.slug}`} key={region.slug}><span>{String(index+1).padStart(2,"0")}</span><div><h2>{region.name}</h2><p>{region.note}</p><small>{region.count.toLocaleString("es-CO")} registros clasificados</small></div><b aria-hidden="true">↗</b></Link>)}</div></section></main>;
}
