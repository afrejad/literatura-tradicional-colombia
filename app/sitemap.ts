import type { MetadataRoute } from "next";
import { corpusRecords } from "./research-data";
export default function sitemap():MetadataRoute.Sitemap{const base="https://literaturatradicional.co";const routes=["","/explorar","/regiones","/generos","/biblioteca","/proyecto","/recursos","/participar","/adrian-freja"];return [...routes.map(route=>({url:`${base}${route}`,changeFrequency:"monthly" as const,priority:route===""?1:.8})),...corpusRecords.map(record=>({url:`${base}/archivo/${record.slug}`,changeFrequency:"monthly" as const,priority:.7}))]}
