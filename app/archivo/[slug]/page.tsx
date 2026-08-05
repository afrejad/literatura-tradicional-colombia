import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { corpusRecords, findCorpusRecord } from "../../research-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const record = findCorpusRecord(slug);
  return record ? { title: record.title, description: record.summary, alternates: { canonical: `/archivo/${record.slug}` } } : { title: "Registro no encontrado" };
}

export default async function RecordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = findCorpusRecord(slug);
  if (!record) notFound();
  const related = corpusRecords.filter((item) => item.slug !== record.slug && (item.regionSlug === record.regionSlug || item.genreSlug === record.genreSlug)).slice(0, 3);
  const sourceHref = validExternalUrl(record.sourceUrl);
  const citation = `Literatura Tradicional en Colombia. (2026). ${record.title} (${record.id}). https://literaturatradicional.co/archivo/${record.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: record.title,
    identifier: record.id,
    genre: record.genre,
    spatialCoverage: [record.locality, record.department, record.region].filter(Boolean).join(", "),
    description: record.summary,
    isPartOf: { "@type": "CollectionPage", name: "Literatura Tradicional en Colombia", url: "https://literaturatradicional.co/" },
    url: `https://literaturatradicional.co/archivo/${record.slug}`,
    inLanguage: "es-CO",
  };

  return <main><article className="record-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <div className="breadcrumbs"><Link href="/">Inicio</Link><span>·</span><Link href="/explorar">Archivo</Link><span>·</span><span>{record.title}</span></div>
    <header className="record-title"><div><div className="record-meta dark-meta"><span>{record.macroType}</span><span>{record.genre}</span></div><h1>{record.title}</h1><p>{record.summary}</p></div><div className={`record-hero-art art-${record.art}`} aria-hidden="true" /></header>
    <div className="record-body">
      <aside><dl>
        <div><dt>Identificador</dt><dd>{record.id}</dd></div>
        <div><dt>Macro tipo</dt><dd>{record.macroType}</dd></div>
        <div><dt>Género o forma</dt><dd>{record.genre}</dd></div>
        {record.genreOriginal && <div><dt>Clasificación original</dt><dd>{record.genreOriginal}</dd></div>}
        <div><dt>Región del corpus</dt><dd><Link className="text-link compact-link" href={`/explorar?region=${record.regionSlug}`}>{record.region}</Link></dd></div>
        <div><dt>Criterio regional</dt><dd>{record.regionCriterion}</dd></div>
        {record.specialZones.length > 0 && <div><dt>Zona especial</dt><dd>{record.specialZones.join("; ")}</dd></div>}
        <div><dt>Departamento</dt><dd>{record.department}</dd></div>
        {record.locality && <div><dt>Municipio o localidad</dt><dd>{record.locality}</dd></div>}
        {record.year && <div><dt>Año de recolección</dt><dd>{record.year}</dd></div>}
        {record.collector && <div><dt>Recolector</dt><dd>{record.collector}</dd></div>}
      </dl></aside>
      <div className="record-content">
        <section><span className="eyebrow"><i /> Ficha documental</span><h2>Metadatos del corpus.</h2><p className="lead">{record.summary}</p><p>Esta ficha procede de la base depurada del proyecto y conserva su identificador estable para facilitar el cotejo, la actualización y la citación.</p></section>
        {record.text ? <section className="corpus-text-section" aria-labelledby="record-text-title">
          <span className="eyebrow"><i /> Transcripción del corpus</span>
          <h2 id="record-text-title">Texto de la pieza</h2>
          <div className={`corpus-text ${record.macroType === "Lírica" ? "corpus-text-lyric" : "corpus-text-narrative"}`}>{record.text}</div>
          <p className="text-provenance-note">El texto se publica con la autorización documentada por el proyecto o a partir de una fuente de dominio público, según corresponda. La referencia de procedencia se conserva en esta misma ficha.</p>
        </section> : <section className="source-box"><strong>Transcripción no disponible</strong><p>Esta ficha no contiene todavía un texto en la columna <em>Obra Texto</em> de la base maestra.</p></section>}
        <section><h3>Fuente documentada</h3><dl className="detail-list">
          {record.sourceType && <div><dt>Tipo</dt><dd>{record.sourceType}</dd></div>}
          {record.sourceAuthor && <div><dt>Autor</dt><dd>{record.sourceAuthor}</dd></div>}
          {record.sourceTitle && <div><dt>Título</dt><dd>{record.sourceTitle}</dd></div>}
          {record.sourceYear && <div><dt>Año</dt><dd>{record.sourceYear}</dd></div>}
          {record.sourceBibId && <div><dt>Referencia enlazada</dt><dd><Link className="text-link compact-link" href={`/biblioteca?q=${encodeURIComponent(record.sourceBibId)}`}>{record.sourceBibId} ↗</Link></dd></div>}
          {sourceHref && <div><dt>Acceso</dt><dd><a className="text-link compact-link" href={sourceHref} rel="noreferrer" target="_blank">Consultar fuente ↗</a></dd></div>}
        </dl></section>
        <section><h3>Control documental</h3><dl className="detail-list">
          {record.metadataStatus && <div><dt>Metadatos</dt><dd>{record.metadataStatus}</dd></div>}
          {record.qualityAlerts && <div><dt>Revisión pendiente</dt><dd>{record.qualityAlerts}</dd></div>}
        </dl></section>
        <section><h3>Cómo citar esta ficha</h3><p className="citation-box">{citation}</p></section>
      </div>
    </div>
    <section className="related"><span className="eyebrow"><i /> Continuar el recorrido</span><h2>Registros relacionados</h2><div>{related.map(item => <Link href={`/archivo/${item.slug}`} key={item.id}><small>{item.genre} · {item.region}</small><strong>{item.title}</strong><span>↗</span></Link>)}</div></section>
  </article></main>;
}

function validExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
