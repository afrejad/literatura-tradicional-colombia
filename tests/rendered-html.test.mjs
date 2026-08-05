import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

async function render(worker, pathname) {
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders development preview metadata", async () => {
  const worker = await loadWorker();
  const response = await render(worker, "/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(await response.text(), developmentPreviewMeta);
});

test("renders the imported corpus and bibliography totals", async () => {
  const worker = await loadWorker();
  const response = await render(worker, "/");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /2\.924/);
  assert.match(html, /2\.239/);
});

test("renders the doctoral system of nine regions", async () => {
  const worker = await loadWorker();
  const response = await render(worker, "/regiones");
  const html = await response.text();
  assert.equal(response.status, 200);
  for (const region of ["Caribe", "Pacífico", "Cafetera", "Cordillera Oriental", "Tolima Grande", "Llanos Orientales", "Amazonía", "Caucana-Valluna", "Nudo de los Pastos"]) {
    assert.match(html, new RegExp(region));
  }
  assert.match(html, /investigación doctoral/);
  assert.doesNotMatch(html, /Región provisional/);
});

test("renders the transcription of a real corpus record", async () => {
  const worker = await loadWorker();
  const response = await render(worker, "/archivo/quien-hizo-las-mujeres-y-los-animales-feos-cltc-0305-n");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Quién hizo las mujeres y los animales feos/);
  assert.match(html, /Texto de la pieza/);
  assert.match(html, /Toda mujer bonita es hija de Eva/);
  assert.doesNotMatch(html, /El texto de la pieza no se publica todavía/);
});

test("pre-filters bibliography searches from the URL", async () => {
  const worker = await loadWorker();
  const response = await render(worker, "/biblioteca?q=BIB-A-0327");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Folklore y etnología/);
  assert.match(html, /<strong>1<\/strong> referencias encontradas/);
});
