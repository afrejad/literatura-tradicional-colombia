import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultConfigPath = path.resolve(scriptDirectory, "..", "app", "regionalization.json");
const regionalization = JSON.parse(fs.readFileSync(defaultConfigPath, "utf8"));

const regionByName = new Map(regionalization.regions.map((region) => [region.name, region]));
const departmentDefaults = new Map();

for (const region of regionalization.regions) {
  for (const department of region.dominantDepartments) departmentDefaults.set(key(department), region.name);
}

departmentDefaults.set("la guajira", "Caribe");
departmentDefaults.set("san andres y providencia", "Caribe");
departmentDefaults.set("san andres providencia y santa catalina", "Caribe");

export { regionalization };

export function classifyRegion({ department, locality }) {
  const departmentKey = key(department);
  const localityKey = key(locality);
  const interregionalLabel = regionalization.method.interregionalLabel;
  const unresolvedLabel = regionalization.method.unresolvedLabel;

  if (["varios", "varios departamentos"].includes(departmentKey)) {
    return {
      region: interregionalLabel,
      regionSlug: slugify(interregionalLabel),
      criterion: "La fuente registra varios departamentos y no permite asignar una sola región",
      specialZones: [],
      status: "interregional",
    };
  }

  const override = regionalization.municipalityOverrides.find((item) =>
    key(item.department) === departmentKey && item.localities.some((candidate) => localityMatches(localityKey, key(candidate))),
  );
  const region = override?.region ?? departmentDefaults.get(departmentKey) ?? unresolvedLabel;
  const specialZones = regionalization.specialZoneMatches
    .filter((item) => item.localities.some((candidate) => localityMatches(localityKey, key(candidate))))
    .map((item) => item.zone);
  const definition = regionByName.get(region);

  return {
    region,
    regionSlug: definition?.slug ?? slugify(region),
    criterion: override?.criterion ?? (definition ? `Departamento dominante de la región ${region}` : "La localización disponible no permite determinar la región"),
    specialZones: [...new Set(specialZones)],
    status: definition ? "regional" : "unresolved",
  };
}

export function validateRegionAssignments(rows) {
  const unresolved = rows.filter((row) => row.regionalization.status === "unresolved");
  if (unresolved.length) {
    const sample = unresolved.slice(0, 12).map((row) => `${row.id}: ${row.department || "∅"} / ${row.locality || "∅"}`);
    throw new Error(`Regionalización incompleta (${unresolved.length} registros): ${sample.join("; ")}`);
  }
}

function localityMatches(value, candidate) {
  return value === candidate || value.split(" ").length > candidate.split(" ").length && value.includes(candidate);
}

function key(value) {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value) {
  return key(value).replace(/\s+/g, "-") || "sin-dato";
}
