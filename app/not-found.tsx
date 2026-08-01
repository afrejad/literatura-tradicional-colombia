import Link from "next/link";
export default function NotFound(){return <main className="not-found"><span>404</span><h1>Esta senda no aparece en el mapa.</h1><p>La página pudo cambiar de lugar o todavía no forma parte del archivo.</p><Link className="button button-primary" href="/explorar">Volver al archivo →</Link></main>}
