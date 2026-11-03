# DESIGN.md — Escapada de desembre 2026

> Sistema de diseño de la web. Basado en la propuesta aprobada el 1 de noviembre de 2026 (`design_preview/`, versión B), sin el botón «Copiar l'enllaç».
> Referencias: `inspiration/page1.png` (base general) y `inspiration/page3.png` (tarjetas). Requisitos: `requisitos_diseno.md` y `requisitos_web.md`.
> **Todo valor visual del CSS sale de este documento** como propiedad personalizada (`--color-…`, `--space-…`, etc.). No se usan frameworks de utilidades.

---

## 1. Principios

1. **Blanco y pastel con función.** El fondo es blanco. El color pastel identifica una zona (A–D) o señala el mejor valor; nunca decora.
2. **Siempre dos precios.** Precio por persona con 6 y con 7, visibles a la vez. No hay selector.
3. **El lugar fijo de cada dato.** Todas las tarjetas y todas las filas del Resum tienen la misma estructura.
4. **Un momento memorable:** las piezas giradas de la cabecera (fotos + etiquetas pastel con las casas más económicas con 6 y con 7). El resto, sobrio.
5. **Lo pendiente es neutro.** «Per confirmar» y «No apta» en gris, nunca en rojo.

## 2. Color

### 2.1. Base

| Token | Hex | Función |
|---|---|---|
| `--color-fons` | `#FFFFFF` | Fondo de página, tarjetas, celdas |
| `--color-panell` | `#F4F5F1` | Panel de navegación, franja de la tarjeta, cabecera del Resum, selector segmentado |
| `--color-fila-parell` | `#FCFCFA` | Filas pares del Resum |
| `--color-hero` | `#EAF5DF` | Fondo de la cabecera (bloque verde pálido de page1) |
| `--color-linia` | `#E3E6DF` | Bordes de tarjeta, cuadrícula del Resum, separadores |
| `--color-linia-forta` | `#C9CEC3` | Borde exterior del Resum, separadores de grupo de columnas |
| `--color-tinta` | `#1C2618` | Texto principal, botón relleno, bordes de botón y marcadores |
| `--color-tinta-2` | `#5B6458` | Texto secundario (solo sobre blanco, panel o hero) |
| `--color-neutre` | `#666E62` | «Per confirmar», «No apta», notas de pie |
| `--color-lila` | `#E3B2F8` | Resaltado «Millor» y distintivos |

### 2.2. Zonas

Mismos colores en tarjeta, Resum, comparador, mapa y actividades.

| Zona | Nombre | `--color-zona-x` (fondo) | `--color-zona-x-fosc` (franja inferior del comparador) | `--color-zona-x-vora` (borde de círculo del mapa) |
|---|---|---|---|---|
| A | Capcir i Cerdanya | `#B4DBFA` | `#8FC6F2` | `#3F7FB5` |
| B | Alt Vallespir | `#FFD6A8` | `#F7BF85` | `#B07535` |
| C | Vallespir, Albera i litoral | `#95EEDD` | `#6FDCC8` | `#2F9C88` |
| D | Conflent | `#C9F296` | `#AEE16F` | `#5F9A2A` |

**Regla:** sobre cualquier pastel (zonas, lila, hero) el texto es siempre `--color-tinta`. Nunca `--color-tinta-2` sobre pastel de zona (4,2:1, no cumple).

### 2.3. Contrastes comprobados (WCAG 2.1)

| Combinación | Ratio | Resultado |
|---|---:|---|
| Tinta sobre blanco | 15,7 | AA/AAA |
| Tinta sobre panel | 14,3 | AA/AAA |
| Tinta sobre hero | 13,9 | AA/AAA |
| Tinta sobre lila | 8,9 | AA/AAA |
| Tinta sobre zona A / A fosc | 10,8 / 8,6 | AA/AAA |
| Tinta sobre zona B / B fosc | 11,5 / 9,5 | AA/AAA |
| Tinta sobre zona C / C fosc | 11,6 / 9,5 | AA/AAA |
| Tinta sobre zona D / D fosc | 12,4 / 10,3 | AA/AAA |
| Blanco sobre tinta (botón relleno) | 15,7 | AA/AAA |
| Tinta-2 sobre blanco / panel / hero | 6,2 / 5,6 / 5,5 | AA |
| Neutre sobre blanco / panel / hero | 5,3 / 4,8 / 4,7 | AA |
| Borde de mapa A / B / C / D sobre base clara | 3,8 / 3,5 / 3,0 / 3,1 | AA gráfico (≥ 3:1) |

Corrección respecto a la propuesta: el neutro `#7C8478` (3,9:1) se sustituye por `#666E62`.

## 3. Degradados

Ninguno. La propuesta aprobada usa solo color plano (como page1). Si en el futuro se añade uno, debe documentarse aquí con su función.

## 4. Tipografía

- **Familia única:** Hanken Grotesk (Google Fonts), pesos 400, 500, 600, 700 y 800, `display=swap`.
- Respaldo: `"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`.
- **Cifras tabulares** (`font-variant-numeric: tabular-nums`) solo en elementos numéricos (precios, celdas numéricas, tiempos), nunca en todo el `body`, porque separa las comas.
- Textos en minúscula inicial, sin mayúsculas sostenidas ni interletraje ampliado.

| Token | Tamaño (escritorio / móvil ≤ 600 px) | Peso | Interlineado | Interletraje | Uso |
|---|---|---:|---:|---:|---|
| `--text-hero` | 54 / 36 px | 500 | 1,08 | −0,02 em | Título de la cabecera |
| `--text-h2` | 40 / 30 px | 500 | 1,08 | −0,02 em | Títulos de sección |
| `--text-preu-gran` | 52 / 44 px | 800 | 1,05 | −0,03 em | Precio del comparador |
| `--text-preu` | 28 px | 700 | 1,2 | −0,02 em | Precio con 6 de la tarjeta |
| `--text-etiqueta-preu` | 26 px | 800 | 1 | −0,02 em | Precio de las piezas de la cabecera |
| `--text-h3` | 23 px | 500 | 1,08 | −0,02 em | Nombre de la casa (tarjeta); 26 px en el comparador |
| `--text-preu-2` | 18 px | 600 | 1,3 | 0 | Precio con 7 de la tarjeta |
| `--text-intro` | 17 px | 400 | 1,5 | 0 | Texto de la cabecera |
| `--text-base` | 16 px | 400 | 1,5 | 0 | Texto corrido |
| `--text-petit` | 14 px | 400 | 1,5 | 0 | Metadatos, listas, Resum |
| `--text-mini` | 13 px | 400–600 | 1,4 | 0 | Cabeceras del Resum, distintivos, totales |

Longitud de línea máxima del texto corrido: `75ch`, salvo los avisos de sección (p. ej. «Atenció» de las actividades) y el pie, que ocupan todo el ancho del contenedor por decisión del grupo. Texto de la cabecera: `46ch`. Entradillas de sección (una frase bajo cada `h2`): hasta `100ch`, para que no se corten a media página; se redactan cortas (≤ 95 caracteres) para que quepan en una línea en escritorio.

## 5. Espaciado

Escala de 4 px.

| Token | Valor | Uso principal |
|---|---:|---|
| `--space-1` | 4 px | Huecos internos mínimos |
| `--space-2` | 8 px | Entre etiqueta y valor; separación de botones |
| `--space-3` | 12 px | Relleno de franjas y filas del mapa |
| `--space-4` | 16 px | Margen lateral en móvil; relleno de pie del comparador |
| `--space-5` | 20 px | Hueco entre tarjetas; relleno interno de tarjeta (18 px redondeado a 20) |
| `--space-6` | 24 px | Relleno del comparador; separación título–contenido |
| `--space-8` | 32 px | Margen lateral en escritorio |
| `--space-12` | 48 px | Separación entre secciones en móvil |
| `--space-18` | 72 px | Separación entre secciones en escritorio |

## 6. Radios

Por jerarquía, no un único radio.

| Token | Valor | Uso |
|---|---:|---|
| `--radius-s` | 3 px | Botones rectangulares, panel de navegación, distintivos, piezas de la cabecera, discos de zona, marcadores |
| `--radius-m` | 6 px | Tarjetas, contenedor del Resum, mapa, lista del mapa |
| `--radius-pill` | 999 px | Solo el botón «+ Comparar» de la tarjeta (patrón de page3) |

## 7. Sombras y bordes

- **Sin sombras** en tarjetas, tablas ni bloques.
- Bordes: 1 px `--color-linia` (tarjetas, cuadrícula); 1 px `--color-linia-forta` (contorno del Resum); 1,5 px `--color-tinta` (botones de contorno, distintivo «Màxim 6 persones», marcadores).
- Foco: `outline: 3px solid var(--color-tinta); outline-offset: 2px` en todos los elementos interactivos; sobre fondo de tinta, `outline-color: var(--color-lila)`.

## 8. Retícula y puntos de ruptura

| Token | Valor |
|---|---|
| `--max-ample` | 1120 px (contenedor principal) |
| Móvil | ≤ 600 px: una columna, margen lateral 16 px |
| Tableta | 601–980 px: tarjetas en 2 columnas |
| Escritorio | > 980 px: tarjetas en 3 columnas; cabecera en 2 columnas (1,05fr / 1fr) |

Se prueba a 375, 768 y 1280 px.

## 9. Componentes

### 9.1. Navegación
Panel `--color-panell`, radio `s`, relleno 10 × 12 px, fijo arriba (`position: sticky`). Logotipo: cuadrado de 30 px en `--color-zona-d` con un icono de montaña en línea, y el texto «Escapada de desembre» en 18 px/600. Enlaces (una página cada uno): «Resum», «Cases», «Comparar», «Mapa», «Activitats», «Què falta preguntar», «Votació» (y «El temps» cuando se active), en 15 px con 18 px de separación. La página actual va en 600 con subrayado de 2 px a 6 px del texto (`aria-current="page"`). El logotipo lleva al inicio. Por debajo de 1100 px, solo el logotipo y un menú desplegable «Seccions», que añade «Inici» al principio.

### 9.1 bis. Páginas
- Cada sección es una página. En las páginas interiores, el título de la sección es el `h1` (con el tamaño de `--text-h2`) y la primera sección empieza 32 px bajo la navegación (16 px en móvil), sin cabecera verde.
- **Inicio:** la cabecera (9.2) y, debajo, «Per on vols començar?» con un acceso por página: rejilla de 3 columnas (2 en tableta, 1 en móvil) de bloques con borde `linia`, radio `m`, relleno 18 px; título en 20 px/600, una frase en 14 px `tinta-2` y una flecha «→» a la derecha. Hover: fondo `panell`.

### 9.2. Cabecera
Bloque `--color-hero` a todo el ancho. Izquierda: título, texto de 17 px, botón de contorno «Veure el resum de les N cases» (N calculado: hoy 5) y la nota «Falta confirmar si som 6 o 7. Preus consultats l'1 de novembre de 2026.» Derecha: composición de 400 px de alto con 3 fotos cuadradas de 190 px y 2 etiquetas de 150 px, giradas entre −6° y +5°. Las etiquetas muestran la casa más económica con 6 (en el color de su zona) y con 7 (en lila), calculadas con los datos. En móvil, la composición se escala al 80 %.

### 9.3. Resum (hoja de cálculo)
- Contenedor con borde `linia-forta`, radio `m` y `overflow: auto`. Tabla con un ancho mínimo de 1250 px.
- Celdas de 44 px de alto con relleno horizontal de 10 px; cuadrícula `linia`. Fila de grupos («Per persona», «Total 4 nits», «Espai», «Valoració», «Equipament»): 30 px.
- Cabecera fija con fondo `panell`; columna ordenada en `#E7EBE1` con «▲» o «▼» y `aria-sort`. Primera columna fija (250 px) con borde derecho `linia-forta`.
- Columnas: Casa, Municipi, €/pers. amb 6, €/pers. amb 7, Total amb 6, Total amb 7, Des de BCN, Places, Dorm., Banys, m², Sobre 10, Ressenyes, Wi-Fi, Jardí, Barbacoa, Estufa, Roba de llit, Mascotes, Aparcament, A tenir en compte, Descartar.
- **Móvil (≤ 600 px): columnas por grupos, sin desplazamiento horizontal.** Encima de la tabla, selector segmentado (estilo page1) con «Per persona», «Total», «Espai», «Valoració», «Equipament» y «Atenció». La tabla muestra la columna «Casa» fija (132 px, nombre en hasta dos líneas a 13 px, disco de 20 px) y solo las columnas del grupo elegido: Per persona (amb 6, amb 7), Total (amb 6, amb 7), Espai (places, dormitoris, banys, m²), Valoració (des de BCN, sobre 10, ressenyes), Equipament (una columna de resumen: «Sí: …», «No: …», «Per confirmar: N») y Atenció (a tenir en compte, descartar). Se oculta la fila de grupos y la columna «Municipi». El grupo elegido se mantiene al reordenar. Celdas de 13 px con relleno horizontal de 8 px.
- Números alineados a la derecha con cifras tabulares. Mejor valor: fondo `lila`, peso 700 y la palabra «Millor» en 11 px. Las notas con menos de 10 reseñas no optan a «Millor».
- «Sí» en peso 500, «No» y «Per confirmar» en `neutre`.

### 9.4. Tarjeta de casa (modelo page3)
Estructura fija, de arriba abajo:
1. **Foto** 16:10 con carrusel: flechas «‹» y «›» de 44 × 44 px (fondo blanco, borde de tinta de 1,5 px, radio `s`) centradas verticalmente a 10 px de cada lado, y contador «2 de 6» abajo a la derecha. La foto que se ve se mantiene al reordenar y se comparte con la ficha emergente. Arriba a la derecha, «Màxim 6 persones» (fondo blanco, borde de tinta de 1,5 px, 13 px/600) solo en casas de máximo 6 (hoy no se muestra ninguna). Abajo a la izquierda, como mucho un distintivo lila: «Més econòmica amb 6», «Més econòmica amb 7», «Millor valorada» o «La més gran».
2. **Valoración:** «★ 4,98 de 5 a Airbnb (44 ressenyes)», en 14 px.
3. **Franja** `panell` con disco de zona de 20 px y «Municipi, Comarca», en 13,5 px `tinta-2`.
4. **Metadatos:** «6 places, 2 dormitoris, 1,5 banys, 84 m²» y, en otra línea, «2 h 20 min des de Barcelona».
5. **Nombre** de la casa (`--text-h3`).
6. **Precios:** con 6 en `--text-preu` y «/per persona amb 6» en 13,5 px; con 7 en `--text-preu-2`, o «No apta per a 7 persones» en `neutre`; los totales y «Confirmar què inclou el preu» en 13 px `neutre`.
7. **Instalaciones:** como mucho 4, en dos columnas, con «✓» (o «✕» para «Estufa de llenya no utilitzable» y «Sense Wi-Fi»).
8. **Acciones:** botón píldora de contorno «+ Comparar» (en estado activo, relleno de tinta con «✓ Comparant»), enlace subrayado «Veure l'anunci» y acción de texto «Descartar».
9. **«Veure detalls»:** botón a todo el ancho al pie de la tarjeta, con «+» en cajita de 20 px, que abre la **ficha emergente** (ver 9.9).

### 9.5. Comparador (modelo de los planes de page1)
- De 2 a 3 columnas con 22 px de separación. Cada casa es un bloque del pastel de su zona, sin radio (como page1), con un relleno de 22 × 24 px.
- Contenido centrado: disco de zona y, si procede, la marca «Millor preu amb 6» (fondo blanco y borde de tinta); nombre en 26 px; municipio; «Amb 6 persones» en 15 px/700; precio en `--text-preu-gran`; «per persona».
- Filas: «Amb 7, per persona», «Des de Barcelona», «Places», «Banys», «Superfície» y «Valoració sobre 10». En cada una, etiqueta y valor en 14 px, separador `rgba(28,38,24,.15)` y una barra de 8 px (pista blanca al 75 %, relleno de tinta, radio `s`). La marca «Millor» va en blanco con borde de tinta. Un dato pendiente no tiene barra ni opta a «Millor».
- Franja inferior en `--color-zona-x-fosc`, de 16 px de alto, con «Veure l'anunci» en 600.
- Debajo, «Diferències clau»: tres listas con «+» o «–» en cajita de 20 px, calculadas con los datos.
- En móvil: columnas apiladas.

### 9.6. Mapa
- Mapa base **estándar de OpenStreetMap** (`tile.openstreetmap.org`), sin filtros, por decisión del grupo, con la atribución «© OpenStreetMap contributors». Excepción a «mapa de baja saturación»: se acepta el estilo por defecto de OSM. Limitación conocida: OSM bloquea las peticiones sin Referer, así que al abrir `index.html` directamente como archivo (`file://`) sale «Access blocked»; funciona en GitHub Pages y con un servidor local. CARTO se descartó porque exige clave de API.
- Casas 1–7: círculo de 1800 m de radio con relleno del pastel de la zona (opacidad 0,45) y borde `zona-vora` de 1,5 px, más un marcador cuadrado de 32 px (radio `s`, pastel, borde de tinta, número).
- Casa 8: marcador en forma de gota (cuadrado girado 45°), sin círculo.
- Actividades: punto de 12 px en el pastel de la zona con borde de tinta.
- Escritorio: mapa de 600 px de alto y, a su lado, una lista de 330 px con las casas visibles (disco, nombre, municipio, €/pers. amb 6 y amb 7 o «Màxim 6»). Móvil: el mapa a todo el ancho (420 px) y la lista debajo.
- Ventana emergente: nombre, municipio y zona, precisión de la ubicación, precio con 6 en 22 px/700, precio con 7 y tiempo desde Barcelona.

### 9.7. Actividades
Agrupadas por zona en **desplegables** (`<details>`), cerrados por defecto, para que la página no sea tan larga. Cada cabecera de 64 px de alto lleva la caja «+», una muestra de 14 px del color de la zona, «Zona X: nombre» en 24 px (20 px en móvil) y, a la derecha, el número de actividades. Se recuerda qué zonas están abiertas al cambiar de pestaña. Cada actividad es una fila de lista, no una tarjeta: nombre en 16 px/500, tipo en 14 px `tinta-2`, estado en diciembre en 14 px `neutre` y enlace a la fuente. Pestañas por tipo con el selector segmentado de page1 (fondo `panell`, opción activa en tinta).

### 9.8. «Què falta preguntar»
Página propia (ya no es un desplegable): cabecera de sección normal con el número de casas a la derecha y, debajo, una tarjeta por casa en dos columnas. Dentro de cada una:
Lista con un «?» en cajita de 20 px; texto en 14 px. Botón de contorno «Copiar les preguntes»; tras copiar, el texto cambia a «Preguntes copiades» durante 2 s.

### 9.9. Ficha emergente («Veure detalls»)
`<dialog>` modal de `min(760px, 100vw − 32px)` de ancho y como máximo `100vh − 64px` de alto; fondo blanco, borde `linia-forta`, radio `m`; telón `rgba(28,38,24,.45)`. En móvil ocupa toda la pantalla, sin radio.
- Cabecera fija: nombre de la casa (`--text-h3`) y botón de contorno «Tancar». Se cierra también con Escape y pulsando el telón.
- Contenido con desplazamiento propio: carrusel 16:10 (mismas flechas que la tarjeta; también con las flechas del teclado), miniaturas de 72 px (la activa con borde de tinta de 2 px), resumen (zona, plazas y precios con 6 y 7) y las secciones Distribució, Equipament, Normes i condicions, Ubicació, En resum y Què falta preguntar.
- Acciones al final: «Copiar les preguntes» (contorno) y «Veure l'anunci» (relleno).

### 9.10. Descartar
Acción de texto «Descartar», en 14 px subrayado. Bloque final plegado «Cases descartades (N)» con la nota «Només ho veus tu, en aquest navegador» y botones «Recuperar», al final de Cases y de Resum.

### 9.10 bis. Votación
- Panel `panell` de hasta 560 px, radio `m`, relleno 18 px: etiqueta «Qui ets?» en 600, desplegable de 44 px con los nombres y botón relleno «Sóc jo»; ayuda en 14 px `tinta-2`. Una vez elegido: «Hola, Nom. Has votat X.» y acciones de texto «Retirar el meu vot» y «No ets tu? Canvia de nom». Mensajes de error precedidos de «Error:» en 600 (no solo color).
- Título «Cases» (`--text-h3`) mientras está abierta; «Resultats» al cerrarse. Debajo, línea de estado y «Han votat: … Falten: …» en 14 px, con las etiquetas en 600.
- **Abierta:** una fila por casa, separadas por `linia`: disco de zona, nombre (500; 700 si es tu voto) y «Municipi · €/pers. amb 7», y botón de contorno de 150 px «Votar» o relleno «✓ El teu vot» (`aria-pressed`). Sin números. Botones al 45 % de opacidad cuando están desactivados.
- **Cerrada:** cada fila añade recuento («2 vots», «29 %») con la marca lila «Més votada» y una barra de 8 px (pista `panell`, relleno tinta); en lugar del botón, «✓ El teu vot» en 14 px/600 en tu casa.
- En móvil, recuento y botón bajo el nombre.

### 9.11. Previsión del tiempo (desactivada)
Cuando se active: un bloque por zona con casas visibles (hoy tres: A, C y D) en el pastel de cada zona, cada uno con el nombre de la zona, la temperatura mínima y máxima y la precipitación y nieve del 4 al 8 de diciembre, y la fuente «Open-Meteo» con la hora de actualización.

### 9.12. Imagen para compartir (`img/compartir.png`)
1200 × 630 px, fondo `--color-hero`, título «Escapada de desembre» en Hanken Grotesk 500 a 88 px, la línea «Del 4 al 8 de desembre de 2026» a 40 px y, a la derecha, la composición de piezas giradas de la cabecera.

### 9.13. Estados
| Estado | Estilo |
|---|---|
| Per confirmar | Texto `neutre`, sin icono de alerta |
| Màxim 6 persones | Distintivo blanco con borde de tinta de 1,5 px |
| No apta per a 7 persones | Texto `neutre` en el lugar del precio con 7 |
| Ubicació aproximada | 13 px `neutre`, junto a la ubicación y en la ventana emergente |
| Confirmar què inclou el preu | 13 px `neutre`, bajo los totales |
| Avisos importantes (p. ej. estancia mínima de 5 noches) | Texto de tinta precedido de «Atenció:» en peso 600; sin rojo |

## 10. Movimiento

Solo como respuesta a acciones del usuario. Con `prefers-reduced-motion: reduce`, todas las duraciones pasan a 0 ms.

| Token | Valor | Uso |
|---|---|---|
| `--motion-curta` | 150 ms `cubic-bezier(.2,0,0,1)` | Estado del botón «Comparar», cambio de orden del Resum |
| `--motion-mitjana` | 250 ms `cubic-bezier(.2,0,0,1)` | Abrir la ficha emergente (aparición y desplazamiento de 8 px), ocultar una casa al descartarla (fundido y colapso) |

Sin animaciones de entrada ni efectos *hover* en las tarjetas. *Hover* solo en botones y enlaces (subrayado o cambio de fondo).
