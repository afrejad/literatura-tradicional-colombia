# Guía para añadir registros al corpus y a la bibliografía

Esta guía explica el flujo de actualización de **Literatura Tradicional en Colombia** sin modificar el diseño del sitio.

## 1. Cómo está organizada la información

Las hojas de cálculo depuradas son la fuente maestra. El sitio no lee directamente todo el archivo de Excel: una orden de importación valida las filas y crea versiones optimizadas para las búsquedas y las fichas web.

```text
Excel maestro → validación e importación → datos públicos del sitio → revisión local → publicación
```

El importador aplica una regla de seguridad: **nunca copia a la web la columna `Obra Texto`**. En esta fase se publican metadatos, no transcripciones. Los registros marcados `No publicar automáticamente` tampoco pasan al sitio.

## 2. Añadir una pieza al corpus

1. Abra `Corpus_Literatura_Tradicional_Colombia_Depurado.xlsx`.
2. Entre en la hoja `Corpus_maestro`.
3. Añada una fila al final de la tabla. Puede copiar la fila anterior para conservar el formato, pero borre sus datos antes de escribir el nuevo registro.
4. Complete, como mínimo:

   - `Corpus Id`: identificador único, por ejemplo `CLTC-2925-N` o `CLTC-2925-L`.
   - `Slug`: dirección corta y única. Puede dejarla vacía y el importador la formará con el título y el identificador.
   - `Macro Tipo`: `Narrativa` o `Lírica`.
   - `Genero Forma Filtro` y `Genero Forma Original`.
   - `Titulo`.
   - `Ano Recoleccion`, cuando se conozca.
   - Localidad, departamento y región provisional.
   - Recolector y datos de la fuente.
   - `Estado Metadatos`, `Estado Derechos` y `Estado Privacidad`.
   - `Publicacion Web Sugerida`.

5. Puede conservar el texto completo en `Obra Texto` para su trabajo académico interno; esa columna no se exporta a la página.
6. Guarde el archivo sin cambiar el nombre de la hoja ni de las columnas.

Para que los metadatos sean visibles, use una decisión editorial que autorice metadatos. Si escribe exactamente `No publicar automáticamente`, el registro permanecerá fuera del sitio.

## 3. Añadir una referencia bibliográfica

1. Abra `Bibliografia_Literatura_Tradicional_Colombia_Depurada.xlsx`.
2. Entre en `Bibliografia_maestra`.
3. Añada una fila al final y complete:

   - `Bib Id`: identificador único, como `BIB-L-0992` para libro o `BIB-A-1249` para artículo.
   - `Slug`: puede dejarse vacío para generarlo automáticamente.
   - `Tipo`, `Autor`, `Ano` y `Titulo`.
   - `Revista` o `Editorial`, según corresponda.
   - Volumen, número, páginas, ciudad, DOI, URL, ISBN o ISSN cuando existan.
   - Cobertura geográfica, temas, idioma y estado de verificación.

4. Registre en `Fuente Verificacion` la URL del catálogo, DOI, repositorio o revista usados para cotejar el dato.
5. Guarde el archivo.

## 4. Importar las hojas al sitio

Abra el proyecto en VS Code y, en el menú **Terminal → Nueva terminal**, ejecute:

```bash
npm run data:import -- \
  --corpus '/ruta/Corpus_Literatura_Tradicional_Colombia_Depurado.xlsx' \
  --bibliografia '/ruta/Bibliografia_Literatura_Tradicional_Colombia_Depurada.xlsx'
```

En Ubuntu puede arrastrar cada archivo desde el explorador hacia la terminal para insertar su ruta. Mantenga las comillas simples cuando la ruta tenga espacios.

La respuesta correcta debe mostrar cinco cifras:

- registros originales del corpus;
- metadatos publicados;
- registros excluidos por revisión;
- textos publicados, que seguirá siendo `0` mientras no exista un protocolo específico;
- referencias bibliográficas.

Si hay identificadores o slugs repetidos, columnas cambiadas o una hoja mal nombrada, la importación se detendrá y explicará el problema. No edite manualmente los archivos dentro de `app/generated`.

## 5. Revisar antes de publicar

Ejecute:

```bash
npm run dev
```

Abra la dirección que aparece en la terminal y compruebe:

1. Busque el nuevo `Corpus Id` en **Explorar**.
2. Abra su ficha y verifique lugar, género, fuente y estados de curaduría.
3. Busque el nuevo `Bib Id` en **Biblioteca**.
4. Pruebe el botón **Copiar cita** y cualquier DOI o URL.
5. Revise también el sitio en un celular o reduzca el ancho de la ventana.

Cuando todo esté correcto, registre los cambios en Git y súbalos a GitHub:

```bash
git add .
git commit -m "Añade nuevos registros al corpus y la bibliografía"
git push
```

## 6. Corregir, retirar o actualizar un registro

- **Corregir:** cambie la fila en la hoja maestra y vuelva a ejecutar la importación.
- **Retirar temporalmente del corpus público:** cambie `Publicacion Web Sugerida` a `No publicar automáticamente` y vuelva a importar.
- **Restaurar:** asigne nuevamente una decisión editorial publicable y repita la importación.
- **Evite borrar identificadores:** un `Corpus Id` o `Bib Id` publicado debe permanecer estable, incluso si se corrige el título o la clasificación.

## 7. Regla para publicar textos completos

La automatización actual publica únicamente metadatos. Para habilitar una transcripción futura debe existir evidencia de, al menos, una de estas condiciones:

- dominio público;
- licencia abierta compatible;
- autorización expresa del titular;
- consentimiento y acuerdos comunitarios aplicables al trabajo de campo.

Cuando se defina ese protocolo se añadirá una columna independiente, por ejemplo `Texto Web Aprobado`, para que la autorización sea explícita y auditable. No debe reutilizarse `Obra Texto` como publicación automática.

