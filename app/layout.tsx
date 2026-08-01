import type { Metadata } from "next";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://literaturatradicional.co"),
  title: { default: "Literatura Tradicional en Colombia", template: "%s | Literatura Tradicional en Colombia" },
  description: "Archivo digital de mitos, leyendas, cuentos, romances, coplas, décimas y bibliografía sobre literatura tradicional colombiana.",
  keywords: ["literatura tradicional colombiana","literatura oral","mitos de Colombia","leyendas de Colombia","cuentos tradicionales","coplas","décimas"],
  authors: [{ name: "Adrián Farid Freja de la Hoz", url: "/adrian-freja" }],
  openGraph: { title: "Literatura Tradicional en Colombia", description: "La memoria narrada de Colombia: un archivo vivo de relatos y formas poéticas tradicionales.", locale: "es_CO", type: "website", url: "/" },
  other: { "codex-preview": "development" }, icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="es"><body><a className="skip-link" href="#contenido">Saltar al contenido</a><SiteHeader/><div id="contenido">{children}</div><SiteFooter/></body></html>}
