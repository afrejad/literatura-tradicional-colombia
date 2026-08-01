import { searchBibliography } from "../../server-search";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  return Response.json(searchBibliography({
    query: params.get("q") ?? "",
    type: params.get("tipo") ?? "todos",
    order: params.get("orden") ?? "antiguos",
    page: positiveInteger(params.get("pagina")),
  }));
}

function positiveInteger(value: string | null) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}
