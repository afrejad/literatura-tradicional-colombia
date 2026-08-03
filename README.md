# Literatura Tradicional en Colombia

Portal académico y divulgativo para documentar, explorar y estudiar mitos,
leyendas, cuentos tradicionales, romances, coplas, décimas y otras formas de
la tradición colombiana.

## Estado del proyecto

Esta es la primera versión funcional. Incluye:

- portada editorial basada en una cartografía de Colombia;
- exploración de 2.899 fichas por búsqueda, macro tipo, región, departamento y género;
- 2.899 transcripciones del corpus, presentadas con sus saltos de línea y enlazadas con sus fuentes;
- fichas individuales enlazadas con sus fuentes y controles documentales;
- recorridos por regiones y géneros;
- biblioteca con 2.239 libros y artículos, filtros, enlaces, copia de citas y descarga CSV;
- páginas de proyecto, recursos, participación y perfil académico;
- diseño adaptable a computador, tableta y celular;
- metadatos, datos estructurados, `robots.txt` y `sitemap.xml`.

El importador excluye 25 registros marcados para revisión manual. En los demás
registros, la columna `Obra Texto` alimenta la transcripción visible de cada
ficha. El corpus cuenta con la autorización documentada por el proyecto o con
fuentes de dominio público, según corresponda.

## Actualizar corpus y bibliografía

La guía paso a paso está en
[`GUIA_ACTUALIZACION_DATOS.md`](GUIA_ACTUALIZACION_DATOS.md). El flujo principal
es:

```bash
npm run data:import -- \
  --corpus '/ruta/Corpus_Literatura_Tradicional_Colombia_Depurado.xlsx' \
  --bibliografia '/ruta/Bibliografia_Literatura_Tradicional_Colombia_Depurada.xlsx'
```

La importación lee `Corpus_maestro` y `Bibliografia_maestra`, valida
identificadores y genera los metadatos, las transcripciones y las referencias
autorizadas para el portal.

## Abrir en VS Code

Requisitos: Node.js 22.13 o posterior y npm.

```bash
git clone URL_DEL_REPOSITORIO
cd literatura-tradicional-colombia
npm install
code .
npm run dev
```

El sitio se abre durante el desarrollo en la dirección indicada por la
terminal.

## Publicar en GitHub

Después de crear un repositorio vacío en GitHub:

```bash
git remote add github https://github.com/USUARIO/REPOSITORIO.git
git push -u github main
```

Se recomienda mantener `main` como rama de publicación, activar la protección
de rama y registrar los cambios mediante *pull requests* cuando el equipo
crezca.

## Organización principal

```text
app/
├── page.tsx                 # portada
├── explorar/                # buscador y filtros
├── archivo/[slug]/          # fichas individuales
├── regiones/                # atlas regional
├── generos/                 # formas literarias
├── biblioteca/              # bibliografía
├── proyecto/                # enfoque y principios
├── recursos/                # materiales educativos
├── participar/              # cooperación
├── adrian-freja/            # perfil académico contextualizado
├── components/              # componentes compartidos
├── generated/               # datos públicos generados desde los libros maestros
├── research-data.ts         # tipos y acceso a las colecciones
├── catalog.ts               # recorridos curatoriales por región y género
├── robots.ts
└── sitemap.ts
```

```text
scripts/
└── import-research-data.mjs # valida e importa los dos libros maestros

public/data/
├── corpus-metadata.csv      # descarga pública sin transcripciones
└── bibliografia.csv         # descarga bibliográfica pública
```

## Dominio previsto

El dominio canónico configurado es `https://literaturatradicional.co`. Antes
de conectar el dominio, deben verificarse los registros DNS y conservarse o
redirigirse las rutas de la versión histórica del sitio.

## Autoría

Proyecto creado por **Adrián Farid Freja de la Hoz**.

ORCID: [0000-0002-0286-3147](https://orcid.org/0000-0002-0286-3147)
