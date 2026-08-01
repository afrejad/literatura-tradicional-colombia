import Link from "next/link";

export function PageHero({
  eyebrow,
  title,
  summary,
  crumb,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  crumb?: string;
}) {
  return (
    <header className="page-hero">
      <div className="breadcrumbs"><Link href="/">Inicio</Link><span>·</span><span>{crumb ?? title}</span></div>
      <div className="page-hero-grid">
        <div><span className="eyebrow"><i /> {eyebrow}</span><h1>{title}</h1></div>
        <p>{summary}</p>
      </div>
    </header>
  );
}
