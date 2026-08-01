import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "../components/PageHero";
import { genres } from "../catalog";

export const metadata: Metadata = { title: "Géneros tradicionales", description: "Mitos, leyendas, cuentos, romances, coplas y décimas de Colombia.", alternates: { canonical: "/generos" } };

export default function GenresPage() {
  return <main><PageHero eyebrow="Formas de la tradición" title="Géneros y poéticas" summary="Las categorías ordenan el archivo sin borrar los cruces entre narración, canto, memoria, performance y vida social." crumb="Géneros" /><section className="inner-section"><div className="genre-catalog">{genres.map((genre,index)=><Link className="genre-panel" href={`/explorar?genero=${genre.slug}`} key={genre.slug}><span className="genre-symbol" aria-hidden="true">{["✦","◌","⌁","∿","❧","Ⅹ"][index]}</span><small>0{index+1} · {genre.count.toLocaleString("es-CO")} registros</small><h2>{genre.name}</h2><p>{genre.description}</p><b>Explorar {genre.name.toLocaleLowerCase("es")} →</b></Link>)}</div></section></main>;
}
