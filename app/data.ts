import { corpusRecords } from "./research-data";

const preferredGenres = ["mitos", "leyendas", "cuentos"];

export const featuredRecords = preferredGenres
  .map((genreSlug) => corpusRecords.find((record) => record.genreSlug === genreSlug))
  .filter((record): record is NonNullable<typeof record> => Boolean(record));

