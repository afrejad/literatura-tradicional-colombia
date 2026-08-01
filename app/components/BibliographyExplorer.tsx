"use client";

import { useEffect, useRef, useState } from "react";
import statsJson from "../generated/stats.json";
import type { BibliographyItem, ResearchStats } from "../research-data";
import type { Paginated } from "../server-search";

const stats = statsJson as ResearchStats;

export function BibliographyExplorer({ initial = {}, initialResult }: { initial?: { query?: string; type?: string }; initialResult: Paginated<BibliographyItem> }) {
  const [query, setQuery] = useState(initial.query ?? "");
  const [type, setType] = useState(initial.type ?? "todos");
  const [order, setOrder] = useState("antiguos");
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
        const params = new URLSearchParams({ q: query, tipo: type, orden: order, pagina: String(page) });
        const response = await fetch(`/api/bibliografia?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("No fue posible consultar la bibliografía");
        setResult(await response.json() as Paginated<BibliographyItem>);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) console.error(error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query ? 180 : 0);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [query, type, order, page]);

  return <div className="bibliography-explorer">
    <div className="bibliography-tools bibliography-tools-rich">
      <label><span>Buscar en la bibliografía</span><input type="search" placeholder="Autor, título, tema, lugar, ISBN, DOI o año" value={query} onChange={event => { setQuery(event.target.value); setPage(1); setLoading(true); }} /></label>
      <label><span>Tipo de documento</span><select value={type} onChange={event => { setType(event.target.value); setPage(1); setLoading(true); }}><option value="todos">Todos ({stats.bibliography.total})</option>{stats.bibliography.types.map(item => <option key={item.slug} value={item.slug}>{item.value} ({item.count})</option>)}</select></label>
      <label><span>Orden</span><select value={order} onChange={event => { setOrder(event.target.value); setPage(1); setLoading(true); }}><option value="antiguos">Más antiguos primero</option><option value="recientes">Más recientes primero</option><option value="autor">Autor A–Z</option></select></label>
    </div>
    <div className="collection-summary"><p><strong>{result.total.toLocaleString("es-CO")}</strong> referencias encontradas · {loading ? "Actualizando…" : `Página ${result.page} de ${result.pageCount}`}</p><a href="/data/bibliografia.csv" download>Descargar bibliografía en CSV ↓</a></div>
    <div className="bibliography-list">{result.items.map((item, index) => <article className="bibliography-row" key={item.id}>
      <span>{String((result.page - 1) * 25 + index + 1).padStart(4, "0")}</span>
      <div><div className="bib-meta"><small>{item.type}</small><small>{item.verificationStatus || "Verificación pendiente"}</small></div><h2>{item.title}</h2><p>{item.author} · {item.year || "s. f."}{item.publication ? ` · ${item.publication}` : ""}</p>{(item.doi || item.url) && <a className="source-link" href={externalUrl(item)} rel="noreferrer" target="_blank">Consultar fuente ↗</a>}</div>
      <button aria-label={`Copiar cita de ${item.title}`} onClick={() => navigator.clipboard?.writeText(item.citation)} type="button">Copiar cita</button>
    </article>)}</div>
    {result.pageCount > 1 && <nav className="pagination" aria-label="Páginas de la bibliografía"><button disabled={result.page === 1} onClick={() => move(result.page - 1)} type="button">← Anterior</button><span>{result.page.toLocaleString("es-CO")} / {result.pageCount.toLocaleString("es-CO")}</span><button disabled={result.page === result.pageCount} onClick={() => move(result.page + 1)} type="button">Siguiente →</button></nav>}
  </div>;

  function move(nextPage: number) {
    setPage(nextPage);
    setLoading(true);
    window.scrollTo({ top: 360, behavior: "smooth" });
  }
}

function externalUrl(item: BibliographyItem) {
  if (item.doi) return `https://doi.org/${item.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")}`;
  return item.url || "#";
}
