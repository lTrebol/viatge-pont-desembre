# Escapada de diciembre 2026 — Requisitos de diseño (UX/UI)

> Documento de diseño visual y de experiencia de usuario. Complementa a:
> - `requisitos_web.md`: funcionalidades, estructura de páginas (una por sección, 4.20), idioma (catalán), mapa, publicación en GitHub Pages y votación (activa con Supabase, 4.8).
>
> **Actualización del 3 de noviembre de 2026:** la web muestra solo las 5 casas con capacidad para 7 o más (1, 5, 6, 7 y 8). Donde este documento dice «ocho casas», léase «las casas visibles». La web pasa a tener una página por sección (ver `DESIGN.md`, 9.1 y 9.1 bis).
> - `casas.md`: datos de los alojamientos.
>
> Si este documento y `requisitos_web.md` entran en conflicto, **las funcionalidades las decide `requisitos_web.md`** y **el aspecto visual lo decide este documento** (y, una vez aprobado, `DESIGN.md`).

---

## 1. Dirección visual

- Estilo **minimalista**, inspirado en Versus.com y en las referencias de la carpeta `/inspiration`, **con `page1.png` como referencia principal** y **`page3.png` como modelo de las tarjetas de alojamiento** (ver 2.2).
- **Fondo blanco** con **colores pastel** planos como acento (ver 2.2).
- Prioridad absoluta a la **claridad, la legibilidad y la jerarquía visual**: en cada pantalla debe quedar claro qué es lo más importante (normalmente, el precio por persona y si la casa es apta para el tamaño del grupo).
- Los alojamientos se organizan en **tarjetas o bloques visuales** que permitan identificar sus características de un vistazo.
- La interfaz debe **facilitar la comparación** de precio, capacidad, instalaciones, ubicación y demás características relevantes.
- Las **diferencias entre alojamientos deben verse**, no solo leerse.
- **Evitar la sobrecarga de información** y los elementos decorativos innecesarios. Cada elemento visual (borde, color, icono, etiqueta, degradado) debe transmitir información o reforzar la jerarquía; si no lo hace, se elimina.
- Toda la interfaz está en catalán (ver `requisitos_web.md`, sección 2).

## 2. Referencias

### 2.1. Versus.com: qué tomar y qué no

Tomar los **patrones de comparación**, no la marca:
- Comparación lado a lado de dos o tres elementos con los mismos atributos alineados por filas.
- Barras horizontales por atributo que muestran de forma proporcional quién gana en cada uno.
- Bloque de «diferencias clave»: qué tiene una casa que la otra no.
- Indicador claro del mejor valor en cada atributo.
- Mucho espacio en blanco y pocos colores, de modo que el color se reserva para señalar diferencias.

No copiar: logotipo, nombre, paleta exacta, iconografía ni textos de Versus.com. La identidad visual debe ser propia de este viaje.

### 2.2. Carpeta `/inspiration`

Contiene capturas de sitios web que gustan al grupo. Son la referencia principal para tipografía, color y espaciado, y se analizan en el paso 1 del proceso (sección 7).

Decisiones del grupo tras la primera propuesta (1 de noviembre de 2026; la propuesta inicial, con fondo frío, degradado de cielo y escala de precios, se descartó):

- **`page1.png` es la referencia principal** de toda la web:
  - Fondo blanco y bloques de color pastel planos y saturados suaves (menta, lima, lila…) que diferencian elementos, como los tres planes de precio.
  - Tipografía sans grotesca, títulos grandes en peso regular, cuerpo pequeño en gris.
  - Botones rectangulares de esquina casi recta: uno relleno en tono muy oscuro y otro solo con contorno.
  - Selector segmentado rectangular, acordeones con «+» en cajita, cabecera con barra de navegación en un panel claro y logotipo en un cuadrado de color.
  - Precio enorme y centrado con la unidad pequeña debajo, lista de características con marca de verificación y franja inferior del mismo color, algo más oscura, para la acción.
  - Composición de la cabecera con piezas cuadradas de color ligeramente giradas.
- **`page3.png` es el modelo de las tarjetas de alojamiento** (sección «Tour packages»): foto arriba, fila de valoración, franja gris clara con el recorrido o la ubicación, metadato pequeño, título, precio grande con la unidad «/per persona» pequeña al lado y botón de contorno a todo el ancho. Fondo blanco, borde fino y radio pequeño.
- **Fondo blanco** y **colores pastel** como acentos con función: color de zona, distintivos y bloques del comparador. El texto sobre pastel siempre en tinta oscura para cumplir el contraste AA.

### 2.3. Imagen de referencia

Si existe una imagen de referencia adicional, debe guardarse en `/inspiration` para incluirla en el mismo análisis.

### 2.4. El tema del viaje como fuente de identidad

El contexto (Pirineo francés en diciembre: montaña, nieve, lagos, piedra, bosque, pueblos de Cerdanya, Capcir, Conflent y Vallespir) es el punto de partida para la paleta, los degradados y el tono, en lugar de estilos genéricos de plantilla.

## 3. Jerarquía de la información

Orden de importancia en toda la web:

1. Precio por persona para 6 y para 7 personas, ambos visibles (no hay selector de tamaño de grupo; ver `requisitos_web.md`, 3.2).
2. Tabla resumen tipo hoja de cálculo para ver todas las opciones de un vistazo (ver 4.7).
3. Aptitud para 7: las casas de máximo 6 personas llevan «Màxim 6 persones» y debe entenderse sin leer el resto de la tarjeta.
4. Nombre, municipio y zona.
5. Capacidad, dormitorios, baños y superficie.
6. Instalaciones destacadas (máximo 3–4 por tarjeta; el resto en el detalle).
7. Avisos y datos pendientes.

## 4. Componentes

### 4.1. Tarjeta de alojamiento

- Modelo visual: tarjetas de `page3.png` (ver 2.2), con la paleta y la tipografía de `page1.png`.
- Estructura fija e idéntica para las ocho casas, para que el ojo compare siempre en el mismo sitio.
- Contenido visible sin abrir el detalle:
  - Número de casa y color de zona (que coincidan con el marcador del mapa).
  - Nombre y municipio.
  - Precio por persona con 6 en grande y con 7 al lado o debajo, al mismo nivel de lectura; los totales, en pequeño. En las casas de máximo 6, el hueco del precio para 7 muestra «No apta per a 7 persones».
  - Fila compacta de datos: capacidad, dormitorios, baños, m².
  - Hasta 3–4 instalaciones destacadas.
  - Valoración, con la escala explícita (/5 Airbnb, /10 Booking).
  - Enlace al anuncio y acción «Comparar».
- El detalle completo (camas, condiciones, horarios, pendientes) se despliega dentro de la tarjeta o en un panel, sin cambiar de página.
- Las casas de máximo 6 personas llevan siempre el distintivo «Màxim 6 persones», en la misma posición que en las demás tarjetas. No se atenúan ni se ocultan.

### 4.2. Comparador (patrón tipo Versus)

- Comparación de dos o tres casas lado a lado, con los atributos alineados por filas.
- Para atributos numéricos (precio por persona, capacidad, baños, m², valoración normalizada), barras horizontales proporcionales y marca del mejor valor de la fila.
- Bloque «Diferències clau»: lista breve de lo que tiene cada casa y no tienen las otras (por ejemplo: piscina, chimenea, aparcamiento, mascota).
- Las diferencias se calculan a partir de los datos de `casas.md`. Si un dato está pendiente, se muestra «Per confirmar» y **no cuenta como ganador ni perdedor**.
- Las valoraciones de Airbnb (/5) y Booking (/10) solo se comparan en barras tras normalizarlas, indicando la escala original.

### 4.3. Indicadores de diferencia en el listado

- Distintivos discretos calculados con los datos, por ejemplo «Més econòmica per persona», «Més banys», «Més gran».
- Como máximo un distintivo por tarjeta, para no convertir el listado en un tablero de etiquetas.
- Se calculan sobre el precio con 6 personas y, cuando proceda, con 7 (p. ej. «Més econòmica amb 7»).

### 4.4. Estados y avisos

- «Per confirmar»: estilo neutro (gris o de baja intensidad), nunca rojo ni con apariencia de error.
- «Màxim 6 persones» / «No apta per a 7 persones»: claro pero sobrio, sin atenuar la tarjeta ni usar rojo de error.
- «Ubicació aproximada»: texto pequeño junto a la ubicación y en el mapa.
- «Confirmar què inclou el preu»: nota discreta junto al precio.
- El color nunca es el único portador del significado: siempre texto o icono además del color.

### 4.5. Mapa

- Estilo de mapa base sobrio y de baja saturación, para que los marcadores destaquen.
- Marcadores numerados con el color de la zona, iguales a los de las tarjetas.
- Ubicaciones aproximadas representadas con un círculo semitransparente, no con un pin preciso.
- Ventana emergente con la misma jerarquía que la tarjeta, en versión mínima.
- Escritorio: mapa junto al listado o en sección propia; móvil: sección propia a ancho completo.

### 4.6. Actividades

- Agrupadas por zona, con el mismo color de zona que las casas.
- Formato de lista o tarjeta compacta, con menos peso visual que los alojamientos.

### 4.7. Tabla resumen tipo hoja de cálculo

- Funcionalidad definida en `requisitos_web.md`, 4.12.
- Aspecto de hoja de cálculo limpia: cuadrícula fina visible, filas de altura compacta pero con zonas táctiles de al menos 44 px, cabecera fija con fondo pastel suave y primera columna fija.
- Cifras alineadas a la derecha y con cifras tabulares solo en las celdas numéricas (no en todo el texto, porque altera la puntuación).
- Mejor valor de cada columna con fondo pastel de resaltado y la palabra «Millor» o un icono con texto alternativo; no solo color.
- El color de zona aparece como una pequeña muestra junto al número de casa, igual que en tarjetas y mapa.
- «Per confirmar» y «No apta» en gris neutro.

### 4.8. Funcionalidades añadidas (ver `requisitos_web.md`, 4.13–4.19)

- **Tiempo desde Barcelona:** dato secundario en la línea de metadatos de la tarjeta y columna en el Resum; nunca compite con el precio.
- **«Què falta preguntar»:** lista neutra (gris, sin rojo), con el botón «Copiar les preguntes» de contorno.
- **Galería:** miniaturas cuadradas con radio pequeño; visor a pantalla completa con fondo de tinta y controles de al menos 44 px.
- **Descartar:** acción de texto discreta en la tarjeta; bloque plegado «Cases descartades» al final del listado.
- **Previsión del tiempo:** cuando se active, una fila de cuatro bloques pastel, uno por zona, con el color de cada zona.

## 5. Reglas para evitar un diseño genérico («AI slop»)

Rasgos que **no** deben aparecer salvo que el análisis del paso 1 lo justifique explícitamente:

- Fondo crema cálido con tipografía serif de alto contraste y acento terracota.
- Fondo casi negro con un único acento verde ácido o bermellón.
- Todo el contenido troceado en tarjetas idénticas con el mismo radio, la misma sombra gris suave y degradados como decoración.
- Etiquetas en MAYÚSCULAS con mucho espaciado encima de cada título.
- Una sola palabra del titular destacada en otro color o en cursiva.
- Cadenas de metadatos unidas con puntos medios («A · B · C»), flechas «→» añadidas a botones y enlaces, y tipografía monoespaciada para datos pequeños.
- Numeraciones decorativas tipo «01 / 02 / 03» si el contenido no es una secuencia.
- Animaciones de entrada en cada sección y efectos hover en todas las tarjetas. Se permite un único momento animado intencionado y las transiciones que respondan a acciones del usuario (desplegar, comparar, cambiar de 6 a 7).
- Tipografías por defecto elegidas sin criterio (Inter, Roboto, Arial, system-ui como fuente principal).

Los **degradados** se permiten, pero deben ser propios del proyecto y con función: por ejemplo, inspirados en la luz de montaña de diciembre o en los colores de cada zona, y usados en pocos lugares (cabecera, identificación de zona o barras del comparador). No como relleno decorativo de cada bloque.

## 6. Calidad mínima

- Diseño **mobile-first**, probado al menos a 375 px, 768 px y 1280 px.
- Contraste mínimo WCAG AA (4,5:1 en texto normal, 3:1 en texto grande y elementos gráficos).
- Foco de teclado visible en todos los elementos interactivos.
- Respeto de `prefers-reduced-motion`.
- Longitud de línea de texto corrido inferior a unos 75–80 caracteres.
- Áreas táctiles de al menos 44 × 44 px.
- Textos de la interfaz en catalán, en minúscula inicial (sentence case), con verbos claros: «Comparar», «Veure l'anunci», «Obrir el mapa».

## 7. Proceso obligatorio

Seguir los pasos en orden. **No avanzar al siguiente sin la aprobación explícita del usuario** donde se indica.

### Paso 1 — Análisis previo de las referencias

**No tocar el código de la web todavía.**

1. Revisar todas las imágenes de la carpeta `/inspiration` del proyecto.
2. Para cada imagen, analizar:
   - Maquetación: retícula, columnas, alineación, densidad, cómo se agrupa la información.
   - Tipografía: familias o estilo (serif, sans, geométrica, humanista…), pesos, tamaños relativos, interlineado.
   - Color: fondo, texto, acentos, cuántos colores se usan y para qué.
   - Espaciado y espacio en blanco: márgenes, separación entre bloques, aire alrededor de los elementos clave.
3. Explicar al usuario **qué tienen en común** las referencias y qué conclusiones se aplican a esta web, incluidos los patrones de Versus.com de la sección 2.1.
4. Crear la carpeta `/design_preview` si no existe y generar en ella imágenes PNG de la propuesta de diseño. Como mínimo:
   - `listado-escriptori.png`: cabecera y listado de tarjetas en escritorio, con precios para 6 y 7.
   - `resum.png`: tabla resumen tipo hoja de cálculo.
   - `listado-mobil.png`: lo mismo en móvil.
   - `comparador.png`: comparación lado a lado de dos o tres casas.
   - `mapa.png`: mapa con marcadores por zona.
   
   Las imágenes pueden generarse con HTML temporal renderizado a PNG (por ejemplo con Playwright). Ese HTML es desechable: debe quedar fuera del código de la web y no reutilizarse sin aprobación. Usar contenido real de `casas.md`, en catalán, no texto de relleno.
5. Si hay dudas entre dos direcciones, presentar como máximo dos propuestas (A y B) con sus PNG.
6. **Detenerse y esperar la aprobación del usuario.**

### Paso 2 — Crear `DESIGN.md`

Solo después de que el usuario apruebe la propuesta del paso 1:

1. Crear `DESIGN.md` en la raíz del proyecto con **valores exactos**, antes de escribir HTML o CSS:
   - Colores: códigos hexadecimales con nombre y función (fondo, superficie, texto principal y secundario, bordes, acento, colores de zona A–D, estados), y los ratios de contraste comprobados.
   - Degradados: definición CSS exacta de cada uno, con su función y dónde se usa.
   - Tipografía: familias (con su origen, por ejemplo Google Fonts, y fuentes de respaldo), pesos exactos, escala de tamaños, interlineado y espaciado entre letras.
   - Espaciado: escala de espaciado (por ejemplo en px o rem) y su uso.
   - Radios de borde: valores por nivel de jerarquía (no un único radio para todo).
   - Sombras y bordes, si se usan.
   - Puntos de ruptura (breakpoints) y anchos máximos.
   - Especificación de los componentes de la sección 4 (tarjeta, comparador, distintivos, estados, mapa).
   - Movimiento: duraciones, curvas y qué acciones lo usan.
2. Todos los valores deben trasladarse después a **propiedades CSS personalizadas** (`--color-…`, `--space-…`, `--radius-…`, etc.) y usarse en un CSS propio, sin frameworks de utilidades que impongan un aspecto genérico.
3. Presentar `DESIGN.md` al usuario y **esperar confirmación antes de generar el HTML y el CSS**.

### Paso 3 — Skills de diseño

Comprobarlo al inicio, antes del paso 1:

1. Verificar si está disponible la skill `frontend-design` de Anthropic u otra skill de diseño equivalente orientada a evitar diseños genéricos.
2. Si no está disponible, instalarla desde una fuente oficial (por ejemplo, el repositorio oficial de skills de Anthropic en GitHub). No instalar skills de fuentes no verificadas.
3. Leer la skill antes de empezar el análisis y aplicar sus pautas en los pasos 1 y 2, junto con la sección 5 de este documento.
4. Indicar al usuario qué skills se han usado o instalado.

## 8. Criterios de aceptación del diseño

- [ ] Se entiende en menos de cinco segundos cuál es la casa más económica por persona con 6 y con 7 personas.
- [ ] La tabla resumen permite ver y ordenar las ocho casas de un vistazo.
- [ ] Las casas de máximo 6 personas se identifican sin leer el resto de la tarjeta.
- [ ] Las ocho tarjetas tienen la misma estructura y los datos en el mismo sitio.
- [ ] El comparador muestra visualmente quién gana en cada atributo y las diferencias clave.
- [ ] Los datos pendientes no parecen errores ni penalizan a ninguna casa.
- [ ] El color de zona es coherente entre tarjetas, mapa y actividades.
- [ ] No aparece ninguno de los rasgos de la sección 5 sin justificación.
- [ ] Toda la interfaz está en catalán.
- [ ] Cumple los mínimos de la sección 6 en móvil y escritorio.
- [ ] Todos los valores visuales del CSS proceden de `DESIGN.md`.
