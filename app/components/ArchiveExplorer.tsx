"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import statsJson from "../generated/stats.json";
import type { CorpusIndexItem, ResearchStats } from "../research-data";
import type { Paginated } from "../server-search";

const stats = statsJson as ResearchStats;

type InitialFilters = { query?: string; region?: string; genre?: string; macroType?: string; department?: string };

export function ArchiveExplorer({ initial = {}, initialResult }: { initial?: InitialFilters; initialResult: Paginated<CorpusIndexItem> }) {
  const [query, setQuery] = useState(initial.query ?? "");
  const [region, setRegion] = useState(initial.region ?? "todas");
  const [genre, setGenre] = useState(initial.genre ?? "todos");
  const [macroType, setMacroType] = useState(initial.macroType ?? "todos");
  const [department, setDepartment] = useState(initial.department ?? "todos");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(initialResult);
  const [loading, setLoading] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query, region, genero: genre, tipo: macroType, departamento: department, pagina: String(page) });
        const response = await fetch(`/api/corpus?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("No fue posible consultar el corpus");
        setResult(await response.json() as Paginated<CorpusIndexItem>);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) console.error(error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query ? 180 : 0);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [query, region, genre, macroType, department, page]);

  function clearFilters() {
    setQuery("");
    setRegion("todas");
    setGenre("todos");
    setMacroType("todos");
    setDepartment("todos");
    setPage(1);
    setLoading(true);
  }

  return (
    <div className="explorer-layout">
      <aside className="filters" aria-label="Filtros del archivo">
        <div className="filter-heading"><span>Filtrar el archivo</span><button onClick={clearFilters} type="button">Limpiar</button></div>
        <label>Palabra clave<input onChange={(event) => { setQuery(event.target.value); setPage(1); setLoading(true); }} placeholder="Título, lugar, fuente o recolector" type="search" value={query} /></label>
        <label>Macro tipo<select onChange={(event) => { setMacroType(event.target.value); setPage(1); setLoading(true); }} value={macroType}><option value="todos">Narrativa y lírica</option>{stats.corpus.macroTypes.map(item => <option key={item.slug} value={item.slug}>{item.value} ({item.count})</option>)}</select></label>
        <label>Género o forma<select onChange={(event) => { setGenre(event.target.value); setPage(1); setLoading(true); }} value={genre}><option value="todos">Todos los géneros</option>{stats.corpus.genres.map(item => <option key={item.slug} value={item.slug}>{item.value} ({item.count})</option>)}</select></label>
        <label>Región provisional<select onChange={(event) => { setRegion(event.target.value); setPage(1); setLoading(true); }} value={region}><option value="todas">Todas las regiones</option>{stats.corpus.regions.map(item => <option key={item.slug} value={item.slug}>{item.value} ({item.count})</option>)}</select></label>
        <label>Departamento<select onChange={(event) => { setDepartment(event.target.value); setPage(1); setLoading(true); }} value={department}><option value="todos">Todos los departamentos</option>{stats.corpus.departments.map(item => <option key={item.slug} value={item.slug}>{item.value} ({item.count})</option>)}</select></label>
        <div className="filter-note"><strong>Corpus con texto</strong><p>Se muestran {stats.corpus.publishedMetadata.toLocaleString("es-CO")} fichas documentales y {stats.corpus.publishedTexts.toLocaleString("es-CO")} transcripciones consultables, enlazadas con sus datos de procedencia.</p></div>
      </aside>

      <section className="results" aria-busy={loading} aria-live="polite">
        <div className="results-head"><p><strong>{result.total.toLocaleString("es-CO")}</strong> {result.total === 1 ? "resultado" : "resultados"}</p><span>{loading ? "Actualizando…" : `Página ${result.page} de ${result.pageCount}`}</span></div>
        <div className="archive-list">
          {result.items.map((record, index) => (
            <Link className="archive-row" href={`/archivo/${record.slug}`} key={record.id}>
              <span className="archive-index">{String((result.page - 1) * 24 + index + 1).padStart(4, "0")}</span>
              <div className={`mini-art art-${record.art}`} aria-hidden="true" />
              <div className="archive-row-copy"><div className="record-meta dark-meta"><span>{record.genre}</span><span>{record.region}</span></div><h2>{record.title}</h2><p>{record.summary}</p><small>{[record.id, record.collector].filter(Boolean).join(" · ")}</small></div>
              <span className="archive-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
        {!result.total && <div className="empty-state"><h2>No encontramos coincidencias.</h2><p>Pruebe otra palabra o limpie los filtros para volver a recorrer todo el archivo.</p></div>}
        {result.pageCount > 1 && <Pagination page={result.page} pageCount={result.pageCount} setPage={(nextPage) => { setPage(nextPage); setLoading(true); }} />}
      </section>
    </div>
  );
}

function Pagination({ page, pageCount, setPage }: { page: number; pageCount: number; setPage: (page: number) => void }) {
  function move(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 360, behavior: "smooth" });
  }
  return <nav className="pagination" aria-label="Páginas de resultados"><button disabled={page === 1} onClick={() => move(page - 1)} type="button">← Anterior</button><span>{page.toLocaleString("es-CO")} / {pageCount.toLocaleString("es-CO")}</span><button disabled={page === pageCount} onClick={() => move(page + 1)} type="button">Siguiente →</button></nav>;
}
