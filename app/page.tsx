import Link from "next/link";
import { regions } from "./catalog";
import { featuredRecords } from "./data";
import { researchStats } from "./research-data";

const schema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Literatura Tradicional en Colombia",
  description: "Archivo digital para explorar mitos, leyendas, cuentos, coplas, décimas y otras formas de la tradición colombiana.",
  url: "https://literaturatradicional.co/",
  inLanguage: "es-CO",
  about: ["literatura tradicional", "literatura oral", "Colombia", "patrimonio cultural"],
  creator: { "@type": "Person", name: "Adrián Farid Freja de la Hoz", sameAs: ["https://orcid.org/0000-0002-0286-3147"] },
};

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="eyebrow"><i /> Archivo digital colombiano</span>
          <h1 id="hero-title">La memoria narrada de Colombia</h1>
          <p className="hero-summary">Un archivo vivo de mitos, leyendas, cuentos, coplas, décimas y otras formas que las comunidades reciben, recrean y transmiten.</p>
          <div className="button-row">
            <Link className="button button-primary" href="/explorar">Explorar el archivo <span aria-hidden="true">→</span></Link>
            <Link className="button button-secondary" href="/proyecto">Conocer el proyecto</Link>
          </div>
        </div>
        <div className="hero-map" aria-label="Accesos para explorar el archivo">
          <form action="/explorar" className="map-search">
            <span aria-hidden="true" className="search-mark" />
            <input aria-label="Buscar en el archivo" name="q" placeholder="Buscar en el archivo" type="search" />
            <button type="submit">Buscar</button>
          </form>
          <div className="coordinate coordinate-top">78°O · 75°O · 72°O · 69°O</div>
          <div className="coordinate coordinate-side">12°N<br />8°N<br />4°N<br />0°</div>
          <div className="map-cards" aria-hidden="true">
            <div className="map-card map-card-region map-card-one"><small>Región</small><strong>Pacífico</strong></div>
            <div className="map-card map-card-genre map-card-two"><small>Género</small><strong>Leyendas</strong></div>
            <div className="map-card map-card-region map-card-three"><small>Región</small><strong>Andes</strong></div>
            <div className="map-card map-card-genre map-card-four"><small>Género</small><strong>Coplas y décimas</strong></div>
          </div>
        </div>
        <nav className="hero-index" aria-label="Formas de explorar">
          <Link href="/regiones"><span className="dot-grid" aria-hidden="true" /> Regiones</Link><span>•</span>
          <Link href="/generos"><span className="wave-mark" aria-hidden="true">≋</span> Géneros</Link><span>•</span>
          <Link href="/biblioteca"><span className="book-mark" aria-hidden="true">▤</span> Bibliografía</Link>
        </nav>
      </section>

      <section className="data-strip" aria-label="Alcance de las colecciones">
        <div><strong>{researchStats.corpus.publishedMetadata.toLocaleString("es-CO")}</strong><span>registros del corpus con metadatos públicos</span></div>
        <div><strong>{researchStats.bibliography.total.toLocaleString("es-CO")}</strong><span>referencias bibliográficas consultables</span></div>
        <div><strong>{researchStats.corpus.departments.filter((item) => item.value !== "Sin dato" && item.value !== "Varios departamentos").length}</strong><span>departamentos representados</span></div>
        <div><strong>0</strong><span>textos publicados sin verificación de derechos</span></div>
      </section>

      <section className="section section-intro">
        <div className="section-kicker"><span>01</span> Una tradición que cambia</div>
        <div className="intro-grid">
          <h2>No es un museo de relatos inmóviles.</h2>
          <div><p className="lead">Aquí, lo tradicional nombra una literatura que vive en sus variantes: cada voz hereda una forma y, al contarla, también la transforma.</p><Link className="text-link" href="/proyecto#concepto">Leer nuestro enfoque <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>

      <section className="section region-section" aria-labelledby="regions-title">
        <div className="section-heading"><div><span className="eyebrow"><i /> Atlas de voces</span><h2 id="regions-title">Recorrer por territorios</h2></div><p>Cada región reúne repertorios, prácticas de transmisión y maneras particulares de imaginar el mundo.</p></div>
        <div className="region-grid">
          {regions.map((region, index) => <Link className="region-tile" href={`/explorar?region=${region.slug}`} key={region.slug}><span className="region-number">0{index + 1}</span><div><h3>{region.name}</h3><p>{region.note}</p><small>{region.count.toLocaleString("es-CO")} registros</small></div><span className="region-arrow" aria-hidden="true">↗</span></Link>)}
        </div>
      </section>

      <section className="section featured-section" aria-labelledby="featured-title">
        <div className="section-heading featured-heading"><div><span className="eyebrow light"><i /> Selección del archivo</span><h2 id="featured-title">Relatos para comenzar</h2></div><Link className="text-link light-link" href="/explorar">Ver todo el archivo →</Link></div>
        <div className="record-grid">
          {featuredRecords.map(record => <Link className="record-card" href={`/archivo/${record.slug}`} key={record.slug}><div className={`record-art art-${record.art}`} aria-hidden="true"><span /></div><div className="record-meta"><span>{record.genre}</span><span>{record.region}</span></div><h3>{record.title}</h3><p>{record.summary}</p><span className="card-link">Abrir ficha <span aria-hidden="true">→</span></span></Link>)}
        </div>
      </section>

      <section className="section library-callout"><div><span className="section-number">02</span><span className="eyebrow"><i /> Biblioteca bibliográfica</span><h2>Las fuentes detrás de las voces.</h2></div><div><p className="lead">{researchStats.bibliography.total.toLocaleString("es-CO")} libros y artículos, navegables por autor, época, título y tipo de documento, acompañan los recorridos del corpus.</p><Link className="button button-primary" href="/biblioteca">Consultar bibliografía →</Link></div></section>
      <section className="section stewardship"><span className="eyebrow"><i /> Curaduría responsable</span><div className="stewardship-grid"><h2>Documentar también es cuidar.</h2><div><p>La plataforma ya permite consultar los metadatos depurados del corpus. Los textos permanecen reservados mientras se verifican derechos de reproducción, consentimiento, privacidad y acuerdos con las comunidades.</p><Link className="text-link" href="/participar">Contribuir al archivo ↗</Link></div></div></section>
    </main>
  );
}
