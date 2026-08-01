import { searchCorpus } from "../../server-search";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  return Response.json(searchCorpus({
    query: params.get("q") ?? "",
    region: params.get("region") ?? "todas",
    genre: params.get("genero") ?? "todos",
    macroType: params.get("tipo") ?? "todos",
    department: params.get("departamento") ?? "todos",
    page: positiveInteger(params.get("pagina")),
  }));
}

function positiveInteger(value: string | null) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

