import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "../components/PageHero";
import { interregionalCoverage, regionSystem, regions } from "../catalog";

export const metadata: Metadata = {
  title: "Sistema regional del corpus",
  description: "Conozca las nueve regiones culturales y territoriales que organizan el corpus de Literatura Tradicional en Colombia.",
  alternates: { canonical: "/regiones" },
};

export default function RegionsPage() {
  return <main>
    <PageHero
      eyebrow="Cartografía oral"
      title="Nueve sistemas regionales"
      summary="Una propuesta analítica para estudiar cómo las tradiciones circulan, se transforman y adquieren sentidos territoriales en Colombia."
      crumb="Regiones"
    />
    <section className="inner-section">
      <div className="region-method">
        <div><span>Propuesta de investigación</span><h2>Cómo funciona la regionalización.</h2></div>
        <div>
          <p className="lead">Esta regionalización fue elaborada por <strong>{regionSystem.author}</strong> en el desarrollo de su investigación doctoral.</p>
          <p>{regionSystem.principle} Por esta razón, algunos departamentos aparecen completos en una región y otros se dividen en fragmentos vinculados a diferentes sistemas culturales.</p>
          <p>Para asignar cada pieza, el corpus prioriza el municipio o la localidad cuando un departamento está fragmentado. Cuando la fuente solo indica el departamento, se utiliza su región dominante. Las zonas especiales internas reconocen singularidades culturales dentro de una región; las zonas de frontera señalan lugares de intercambio intenso entre dos o más sistemas.</p>
          <p>Los registros cuya fuente dice literalmente <em>VARIOS</em> conservan la etiqueta <strong>{interregionalCoverage.name}</strong>. Esta cobertura agrupa {interregionalCoverage.count.toLocaleString("es-CO")} piezas y no constituye una décima región.</p>
        </div>
      </div>

      <div className="region-catalog">
        {regions.map((region, index) => <Link className="region-panel" href={`/explorar?region=${region.slug}`} key={region.slug}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div><h2>{region.name}</h2><p>{region.note}</p><small>{region.count ? `${region.count.toLocaleString("es-CO")} registros clasificados` : "Sin registros localizados en esta versión"}</small></div>
          <b aria-hidden="true">↗</b>
        </Link>)}
      </div>

      <section className="regionalization-detail" aria-labelledby="regionalization-table-title">
        <div className="section-heading compact-heading"><div><span className="eyebrow"><i /> Estructura territorial</span><h2 id="regionalization-table-title">Tabla de las nueve regiones</h2></div><p>La extensión es aproximada y las categorías territoriales responden al modelo cultural de la investigación.</p></div>
        <div className="region-table-scroll">
          <table className="region-table">
            <thead><tr><th>Región</th><th>Departamentos dominantes</th><th>Fragmentos de departamentos</th><th>Zonas especiales internas</th><th>Zonas especiales de frontera</th><th>Área aproximada en km²</th></tr></thead>
            <tbody>{regions.map((region) => <tr key={region.slug}>
              <th scope="row">{region.name}</th>
              <td>{toList(region.dominantDepartments)}</td>
              <td>{toList(region.departmentFragments)}</td>
              <td>{toList(region.internalZones)}</td>
              <td>{toList(region.frontierZones)}</td>
              <td className="region-area">{region.areaKm2.toLocaleString("es-CO")}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className="region-footnote"><sup>1</sup> Son muchas las posibles zonas especiales de frontera; se enuncian únicamente aquellas que representan un importante intercambio cultural dentro de los límites de dos o más sistemas culturales regionales.</p>
      </section>
    </section>
  </main>;
}

function toList(values: string[]) {
  return <ul>{values.map((value) => <li key={value}>{value}</li>)}</ul>;
}
