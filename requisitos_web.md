# Escapada de diciembre 2026 — Requisitos de la página web

> Documento de requisitos funcionales y de UX para entregar a Claude. Los datos de los alojamientos están en `casas.md`.  
> **No generar aquí código ni implementar la web:** este archivo define la estructura, las reglas y la experiencia de usuario.

## 1. Objetivo del proyecto

Crear una web de una sola página, **íntegramente en catalán**, para que un grupo de 6 o 7 personas pueda comparar y debatir ocho alojamientos candidatos para la escapada del 4 al 8 de diciembre de 2026, con un mapa de sus ubicaciones.

**Prioridad de contenido**
1. Alojamientos: comparación clara y fiable de precio (para 6 y 7 personas), capacidad, distribución, equipamiento, condiciones y ubicación.
2. Tabla resumen tipo hoja de cálculo con todas las casas (ver 4.12).
3. Mapa con la ubicación de las casas.
4. Entorno y actividades: propuestas de visitas, naturaleza, rutas y actividades organizadas por zonas.
5. Votación: **desactivada en esta versión.** La sección existe en el HTML pero oculta, preparada para activarse en el futuro con una base de datos (ver 4.8).

## 2. Idioma

- Toda la web debe estar **exclusivamente en catalán**: títulos, menús, botones, etiquetas, filtros, avisos, estados vacíos, textos alternativos de imágenes, leyenda del mapa, ventanas emergentes, mensajes de error, `<title>` y metadatos. Usar `lang="ca"` en el documento.
- No incluir selector de idioma ni textos en castellano, inglés o francés.
- Traducir al catalán las descripciones de `casas.md` y de las actividades. Excepciones: nombres propios de los alojamientos (p. ej. «Le Bellevue» côté Montagne, Maison Mânes), topónimos oficiales y citas literales de los anuncios, que pueden mantenerse en su forma original.
- Para topónimos con forma catalana consolidada, usar la catalana (p. ej. Font-Romeu, Vallespir, Conflent, Capcir, Cerdanya, Canigó, Cotlliure, Perpinyà, Ceret, Prats de Molló, Vilafranca de Conflent).
- Formato numérico y de fechas en catalán: «4–8 de desembre de 2026», «104,50 €», separador decimal coma.
- Textos de estado recomendados: «Per confirmar», «No apta per a 7 persones», «Ubicació aproximada», «Confirmar què inclou el preu».

## 3. Datos y cálculo de precios

### 3.1. Fuente de datos
- Los datos de las casas provienen de `casas.md` y deben guardarse separados del diseño en un objeto/JSON fácil de editar.
- Cada casa debe tener los precios por tamaño de grupo, por ejemplo: `preus: { "6": 627, "7": 668 }`; si no admite 7 personas, `"7": null`.
- Incluir la fecha de consulta de los precios (1 de noviembre de 2026) y un campo `lastUpdated`.

### 3.2. Tamaño de grupo: sin selector (decisión del 1 de noviembre de 2026)
- **No hay selector 6 / 7 personas** ni pregunta «Quantes persones som?». Se muestran siempre **todas las casas** y **los precios para 6 y para 7 personas a la vez**.
- Regla de capacidad: las casas que admiten 7 personas también admiten 6 (casas 1, 5, 6, 7 y 8: tienen precio para 6 y para 7). Las casas que solo admiten 6 no admiten 7 (casas 2, 3 y 4: solo tienen precio para 6).
- Las casas de máximo 6 personas se marcan siempre con «Màxim 6 persones», y en el lugar del precio para 7 se muestra «No apta per a 7 persones», nunca 0 € ni un precio inventado. No se ocultan ni se atenúan, porque siguen siendo válidas si finalmente somos 6.
- Mientras no se confirme el grupo, se mantiene visible un aviso discreto: «Falta confirmar si som 6 o 7».

### 3.3. Fórmulas
- `preu_per_persona = preu_total[n] / n`
- `preu_per_persona_nit = preu_total[n] / (n * 4)`

Calcular siempre las dos variantes, `n = 6` y `n = 7` (esta última solo para las casas que admiten 7). No dividir siempre entre seis.

## 4. Requisitos de UX/UI

### 4.1. Principios generales

- Diseño responsive, mobile-first y fácil de usar desde móvil.
- Estética acogedora e invernal: verde pino, madera, blanco roto, gris piedra y azul oscuro.
- Jerarquía visual clara: casas primero, actividades después.
- Evitar una página demasiado larga y cargada de texto: mostrar información esencial y permitir desplegar detalles.
- Tipografía legible, buen contraste y botones suficientemente grandes para móvil.
- Idioma: exclusivamente catalán (ver sección 2).
- Fechas siempre visibles: 4–8 diciembre de 2026.

### 4.2. Cabecera / resumen del viaje

Mostrar:
- Nombre del viaje (editable).
- Fechas y número de noches.
- Número de participantes: texto informativo «6 o 7 persones» con el aviso «Falta confirmar si som 6 o 7» (sin selector; ver sección 3.2).
- Estado de la decisión: «Comparant allotjaments» o «Casa escollida» (editable en los datos).
- Accesos rápidos a «Resum», «Cases», «Mapa» y «Activitats». No mostrar enlace a la votación mientras esté oculta.

### 4.3. Sección principal: casas candidatas

Cada tarjeta debe mostrar, en este orden:

1. Foto principal real del alojamiento, preferentemente obtenida del anuncio o proporcionada por el grupo.
2. Nombre y localidad.
3. Precio por persona para 6 y para 7 personas (el de 7 sustituido por «No apta per a 7 persones» en las casas de máximo 6).
4. Precio total y precio por persona/noche para 6 y para 7.
5. Capacidad y distintivo «Màxim 6 persones» en las casas 2, 3 y 4.
6. Número de dormitorios, camas y baños.
7. Valoración y número de evaluaciones (no mostrar la nota sin el número de opiniones).
8. Etiquetas de características verificadas: jardín, barbacoa, chimenea/estufa operativa, mascota, Wi-Fi, aparcamiento, piscina disponible en las fechas, etc.
9. Avisos relevantes: ropa de cama no incluida, limpieza a cargo del huésped, piscina cerrada, acceso complicado, estancia mínima incompatible, etc.
10. Localidad y enlace a mapa aproximado.
11. Botón «Ver anuncio original».
12. Botón «Veure detalls» que abra una ficha emergente (ventana modal) con fotos, distribución, equipamiento, normas, costes y preguntas pendientes.

No destacar una piscina si está cerrada durante las fechas del viaje. Distinguir siempre entre chimenea/estufa disponible y chimenea/estufa que no se puede utilizar.

### 4.4. Filtros y ordenación

Filtros:
- Capacidad mínima (6, 7 u 8 plazas).
- Precio máximo por persona.
- Zona.
- Número mínimo de dormitorios.
- Número mínimo de baños.
- Características: jardín, barbacoa, estufa/chimenea operativa, Wi-Fi, mascotas, aparcamiento, ropa de cama incluida.
- «Solo alojamientos compatibles con las fechas».
- «Només cases aptes per a 7 persones».

Ordenación:
- Precio por persona con 6, ascendente/descendente.
- Precio por persona con 7, ascendente/descendente.
- Precio total con 6 o con 7, ascendente/descendente.
- Mejor valoración (mostrar siempre número de reseñas).
- Mayor capacidad.

Al ordenar por precio para 7, las casas sin precio para 7 (casas 2, 3 y 4) aparecen al final con «No apta per a 7 persones», nunca como 0 €.

### 4.5. Comparador

Permitir seleccionar dos o tres casas y ver una tabla comparativa con:
- Precio total y precio por persona para 6 y para 7 personas (mostrar ambos).
- Capacidad / dormitorios / camas / baños.
- Valoración y número de reseñas.
- Distancia o tiempo de conducción a las actividades elegidas (solo cuando se haya calculado con ubicaciones verificadas).
- Equipamiento.
- Costes adicionales.
- Inconvenientes y condiciones especiales.

En móvil, la comparación debe poder desplazarse horizontalmente o convertirse en bloques por alojamiento.

### 4.6. Mapa de ubicaciones (obligatorio)

La web debe incluir un mapa interactivo con la ubicación de las ocho casas.

- Usar datos de `casas.md`, sección 5.1 (coordenadas y precisión de cada casa).
- Se recomienda Leaflet con teselas de OpenStreetMap (sin clave de API), incluyendo la atribución obligatoria «© OpenStreetMap contributors». No usar proveedores que exijan clave (CARTO la exige desde 2026) ni que bloqueen la web abierta en local (las teselas de OpenStreetMap rechazan peticiones sin Referer). Por decisión del grupo se usa el mapa estándar de OpenStreetMap: funciona publicado en GitHub Pages o con un servidor local, pero no abriendo `index.html` directamente como archivo.
- Marcadores numerados del 1 al 8, con color por zona (A, B, C, D) y leyenda en catalán. No depender solo del color: el número y la zona deben verse también en texto.
- Casas 1–7: ubicación aproximada (centro del municipio). Representarlas con un círculo de radio aproximado o un marcador con la indicación «Ubicació aproximada». No colocar un pin que parezca una dirección exacta.
- Casa 8: ubicación exacta, a partir de la dirección publicada en Booking.
- Al pulsar un marcador: ventana emergente con nombre, municipio, precio por persona para 6 y para 7 (o «No apta per a 7 persones») y enlace a la tarjeta de la casa.
- Al seleccionar una casa en el listado, centrar el mapa en ella y destacar las actividades de su zona.
- Las casas 2, 3 y 4 llevan en el marcador y en la ventana emergente la indicación «Màxim 6 persones».
- Mostrar también las actividades (sección 5) como capa opcional con filtros por tipo.
- Si se muestra tiempo de conducción, calcularlo mediante un servicio de mapas real; no inventar distancias.
- El mapa debe ser usable en móvil (altura adecuada, gestos táctiles, no bloquear el desplazamiento de la página).

### 4.7. Actividades

Organizar por pestañas o filtros, y agrupar por zona en desplegables cerrados por defecto para no alargar la página:
- Naturaleza y miradores.
- Rutas y paseos.
- Pueblos y patrimonio.
- Nieve y deportes de invierno.
- Bienestar / baños termales.
- Gastronomía y mercados.

Cada ficha debe incluir:
- Nombre y fotografía.
- Descripción breve y útil.
- Zona.
- Casas más cercanas.
- Distancia/tiempo en coche (si se verifica).
- Duración aproximada de la visita (si se conoce).
- Dificultad, desnivel y distancia para rutas (solo con fuente fiable).
- Precio, reserva y horario cuando estén confirmados.
- Enlace a la fuente oficial.
- Aviso de temporada/meteorología cuando corresponda.

Para rutas en montaña en diciembre:
- No asumir que una ruta estival es adecuada en invierno.
- Mostrar dificultad, desnivel, duración y condiciones solo con información contrastada.
- Indicar que nieve, hielo, viento, visibilidad y cierres pueden cambiar la viabilidad.
- Priorizar paseos sencillos y alternativas de baja cota si no hay información suficiente.

### 4.8. Votación (oculta, preparada para el futuro)

En esta versión **no hay votación**: la web se publica en GitHub Pages como sitio estático y no guarda datos compartidos.

Requisitos para dejarla preparada:
- Incluir en el HTML una sección `<section id="votacio" hidden>` con la estructura de la votación ya maquetada: título, listado de las casas con un botón «Votar» en cada una, bloque «El meu vot» y bloque «Resultats del grup» (número de votos y porcentaje por casa).
- Controlar la visibilidad con un único interruptor en la configuración de datos, por ejemplo `config.votacioActiva = false`. Con `false`:
  - la sección permanece con el atributo `hidden` (no visible ni accesible para lectores de pantalla);
  - no aparece en el menú ni en los accesos rápidos;
  - no se ejecuta ningún código de votación ni se hacen peticiones a servicios externos;
  - las tarjetas de las casas no muestran botones ni recuentos de votos.
- No usar `localStorage` para simular votos ni mostrar resultados ficticios.
- Separar el código de la votación en un módulo propio (por ejemplo `votacio.js`) con funciones vacías o comentadas (`carregarVots()`, `enviarVot()`, `mostrarResultats()`), de modo que activarla solo requiera conectar el servicio y cambiar el interruptor.
- Textos de la sección ya escritos en catalán.

Cuando se active en el futuro:
- Usar una base de datos gratuita (Supabase recomendado, o Firebase) con reglas de acceso (Row Level Security) para que nadie pueda borrar ni falsear votos, ya que la clave pública queda visible en el código.
- Identificar a cada participante con una lista cerrada de nombres o un código por persona.
- Permitir un voto por participante, cambiar el voto y cerrar la votación.
- Mostrar número de votos y porcentaje, sin datos personales innecesarios.

### 4.9. Publicación en GitHub Pages

- Sitio 100 % estático: `index.html`, CSS, JavaScript y archivo de datos, sin servidor ni paso de compilación obligatorio.
- Rutas relativas para que funcione en la subruta del repositorio (`https://usuario.github.io/repositorio/`).
- Librerías externas (por ejemplo Leaflet) cargadas desde CDN con versión fija, o incluidas en el repositorio.
- No incluir claves privadas ni datos personales en el repositorio, que con cuenta gratuita debe ser público.

### 4.10. Compartir y actualización

- Sin botón para copiar el enlace (decisión del 1 de noviembre de 2026): se comparte la URL directamente desde el navegador.
- Los enlaces de los anuncios deben abrirse en una pestaña nueva.
- Los datos deben estar separados del diseño en un objeto/JSON fácil de editar.
- Incluir `lastUpdated` o «Última actualización» para precios, disponibilidad y horarios.
- No afirmar que un alojamiento está disponible si no se ha comprobado en la plataforma.
- Los precios deben incluir la fecha de consulta y el número de huéspedes usado.

### 4.11. Accesibilidad y calidad

- Contraste suficiente.
- Navegación por teclado.
- Estados de foco visibles.
- Etiquetas accesibles en controles y filtros.
- No depender únicamente del color para comunicar estados.
- Imágenes con texto alternativo.
- Estados vacíos claros («No hay casas que coincidan con estos filtros»).
- Mensajes claros para datos pendientes o no verificados.
- Carga rápida y optimización de imágenes.

### 4.12. Tabla resumen tipo hoja de cálculo («Resum»)

Sección propia, situada antes de las tarjetas, para ver rápidamente todas las opciones de un vistazo, como en una hoja de Excel.

- Una fila por casa (las ocho) y una columna por atributo, con cuadrícula visible, cabecera fija y la primera columna (número y nombre de la casa) fija al desplazarse en horizontal.
- Columnas mínimas: número y nombre, zona (con su color), municipio, €/persona con 6, €/persona con 7, total con 6, total con 7, plazas, dormitorios, baños, m², valoración (nota original con su escala y número de reseñas, más la nota normalizada sobre 10), Wi-Fi, jardín, barbacoa, estufa/chimenea operativa, ropa de cama incluida, mascotas, aparcamiento y condición crítica (p. ej. estancia mínima de 5 noches, piscina cerrada, acceso difícil).
- Ordenable pulsando la cabecera de cada columna, con el sentido de orden indicado con texto accesible (`aria-sort`).
- Resaltar el mejor valor de cada columna numérica (p. ej. el €/persona más bajo). Los datos pendientes se muestran como «Per confirmar» y no cuentan como mejor ni peor.
- Las casas de máximo 6 muestran «No apta» en las columnas de 7 personas.
- Las características booleanas usan «Sí», «No» y «Per confirmar» en texto (no solo iconos ni solo color).
- Al pulsar una fila se va a la tarjeta de esa casa.
- En móvil, la tabla se desplaza en horizontal dentro de su contenedor, sin desplazar la página.
- Opcional: casillas para elegir 2 o 3 filas y abrirlas en el comparador.

### 4.13. Tiempo en coche desde Barcelona

- Solo desde Barcelona hasta cada casa. **No** se calcula de momento la distancia de cada casa a las actividades.
- Origen: plaça de Catalunya (41.3870, 2.1700). Calculado con un servicio de rutas real (OSRM, datos de OpenStreetMap) el 1 de noviembre de 2026 y guardado en `js/dades.js` (campo `tempsBCN` de cada casa y objeto `origenTrajecte`).
- Se muestra en la tarjeta, en la tabla Resum (columna ordenable), en el comparador (barra: menos es mejor) y en la ventana emergente del mapa, con el formato «2 h 20 min, 167 km».
- Aviso junto al dato: «Sense trànsit ni neu. Ubicació aproximada» (casas 1–7) o «Sense trànsit ni neu» (casa 8).

### 4.14. Enlace que guarda la comparación

- Al seleccionar 2 o 3 casas para comparar, la URL se actualiza con un fragmento, p. ej. `#comparar=2-8-1`, sin recargar la página.
- Al abrir una URL con ese fragmento, la web selecciona esas casas y abre el comparador.
- Identificadores inválidos o repetidos se ignoran; más de 3 se recortan a 3.

### 4.15. Vista previa al compartir

- Etiquetas Open Graph y Twitter Card (`og:title`, `og:description`, `og:image`, `og:url`, `og:locale = ca_ES`) para que al pegar el enlace en WhatsApp o Telegram aparezca una tarjeta.
- Imagen propia de 1200 × 630 px en PNG (`img/compartir.png`), con el nombre del viaje y las fechas, siguiendo `DESIGN.md`.
- `og:image` y `og:url` requieren la URL absoluta de GitHub Pages (`config.urlPublica`); queda pendiente hasta conocer la URL del repositorio.

### 4.16. «Què falta preguntar»

- Dentro de cada tarjeta (en «Veure detalls») y como sección propia **desplegable, cerrada por defecto** (se abre desde la navegación), una lista por casa de los datos «Per confirmar» generada a partir de `dades.js` (campos `null`, pendientes económicos y condiciones como la estancia mínima de la casa 7).
- Botón «Copiar les preguntes» por casa, que copia al portapapeles un mensaje breve en catalán listo para enviar al anfitrión, con confirmación visible «Preguntes copiades».

### 4.17. Galería de fotos por casa

- Hasta 6 fotos por casa (campo `fotos`), con la primera como foto principal de la tarjeta.
- En la propia tarjeta del listado, flechas izquierda y derecha para pasar las fotos, con contador «N de 6».
- En la ficha emergente de «Veure detalls», la misma foto con flechas, miniaturas y navegación con el teclado (flechas, Escape para cerrar), con texto alternativo «Foto N de M de la casa».
- Imágenes con `loading="lazy"`; si una imagen no carga, se oculta sin romper la tarjeta.
- Casa 8 (Booking): sin fotos por ahora; se muestra «Foto de l'anunci pendent».

### 4.18. Descartar casas (solo en tu navegador)

- Botón «Descartar» en cada tarjeta y en cada fila del Resum. Una casa descartada se oculta del listado, del Resum y del comparador, y queda en un bloque plegado «Cases descartades (N)» con la acción «Recuperar».
- Se guarda en `localStorage` del navegador de cada persona: no se comparte ni es una votación, y así se indica en la interfaz («Només ho veus tu»).
- Si `localStorage` no está disponible, la función sigue funcionando durante la visita sin guardar.

### 4.19. Previsión del tiempo (preparada, desactivada)

- Interruptor `config.meteoActiva = false`. Con `false`, la sección está oculta (`hidden`) y no se hace ninguna petición.
- Activarla a finales de noviembre de 2026: previsión del 4 al 8 de diciembre por zona (A, B, C, D) con Open-Meteo (sin clave), mostrando temperatura mínima y máxima, precipitación y nieve prevista, con la fuente y la hora de actualización.
- Código en un módulo propio (`js/meteo.js`) con funciones preparadas, igual que la votación.

## 5. Propuestas de lugares de interés y actividades

Las propuestas siguientes son ideas iniciales para enriquecer la web, no confirmaciones de apertura ni reservas. Para el puente de diciembre de 2026 hay que comprobar horarios, disponibilidad, nieve, meteorología y accesos antes de publicar la actividad como disponible.

### 5.1. Zona A — Capcir y Cerdanya (casas 1, 2, 3 y 8)

| Lugar / actividad | Tipo | Qué ofrece | Casa(s) más cercanas | Estado para diciembre |
|---|---|---|---|---|
| Lago de Matemale | Naturaleza / paseo | Lago de montaña y entorno boscoso; el anuncio de Casa 1 indica unos 100 m | Casa 1 | Confirmar accesos y actividades de invierno |
| Les Angles | Pueblo / estación de montaña | Estación y actividades de montaña; el chalet 1 indica menos de 10 min | Casa 1, también accesible desde 2 | Consultar calendario de apertura |
| Parque de animales de Les Angles | Visita | Recorrido para observar fauna de montaña | Casas 1 y 2 | Verificar apertura invernal y horarios |
| Cambre d'Aze | Nieve / montaña | Estación de esquí y entorno de montaña; Casa 2 indica 800 m | Casa 2 | Consultar apertura de temporada |
| Font-Romeu | Pueblo / montaña | Centro de montaña, comercios y acceso a actividades de invierno | Casas 3 y 8 | Consultar actividades y horarios |
| Gran Horno Solar de Odeillo | Visita cultural/científica | Instalación solar emblemática; Casa 3 indica unos 10 min a pie | Casa 3 | Verificar visitas y reservas |
| Bains de Llo | Bienestar | Baños termales al aire libre/interiores según instalaciones | Casa 2 y zona A | Verificar horarios, tarifas y reserva |
| Bains de Dorres | Bienestar | Baños termales con vistas al paisaje de montaña | Casa 2 y zona A | Verificar horarios y condiciones |
| Bains de Saint-Thomas | Bienestar | Complejo termal en entorno natural | Casa 2 y zona A | Verificar horarios y reserva |
| Lac des Bouillouses | Naturaleza / senderismo | Paisaje de alta montaña y lago | Casas 1 y 2 | Acceso invernal sujeto a nieve y restricciones; no prometer acceso en coche |
| Mont-Louis | Patrimonio | Ciudadela y fortificaciones de Vauban | Zona A | Verificar horarios de visitas |
| Tren Amarillo (Train Jaune) | Experiencia / transporte panorámico | Recorrido ferroviario panorámico por los Pirineos | Zona A | Consultar servicio, horarios y posibles obras |

### 5.2. Zona B — Haut-Vallespir (casa 4)

| Lugar / actividad | Tipo | Qué ofrece | Casa más cercana | Estado para diciembre |
|---|---|---|---|---|
| Prats-de-Mollo-la-Preste | Pueblo / patrimonio | Pueblo de montaña, patrimonio y ambiente del Haut-Vallespir | Casa 4 | Consultar horarios de monumentos |
| Fort Lagarde | Patrimonio | Fortaleza histórica vinculada a Prats-de-Mollo | Casa 4 | Confirmar apertura y visitas |
| La Preste-les-Bains | Bienestar | Entorno termal | Casa 4 | Consultar temporada y reservas |
| Domaine de Falgos | Deporte / ocio | Golf y entorno rural | Casa 4 | Confirmar actividad y acceso |
| Senderos del Vallespir | Naturaleza / senderismo | Rutas de montaña y bosque | Casa 4 | Seleccionar ruta según nieve, barro, meteorología y nivel del grupo |

### 5.3. Zona C — Le Boulou, Vallespir, Albères y litoral (casa 5)

| Lugar / actividad | Tipo | Qué ofrece | Casa más cercana | Estado para diciembre |
|---|---|---|---|---|
| Le Boulou | Pueblo / servicios | Comercios, mercado, restaurantes y servicios | Casa 5 | Consultar días de mercado y horarios |
| Maison de l'Eau et de la Méditerranée | Visita cultural | Centro de interpretación sobre agua y Mediterráneo | Casa 5 | Confirmar horarios |
| Céret | Pueblo / cultura | Centro histórico, arte y ambiente local | Casa 5 | Confirmar apertura de museos |
| Museo del Corcho (Maureillas) | Visita cultural | Patrimonio industrial y cultural del corcho | Casa 5 | Confirmar horarios |
| Capilla de Saint-Martin de Fenollar | Patrimonio | Capilla románica | Casa 5 | Confirmar apertura |
| Collioure | Pueblo / costa | Puerto, casco antiguo, patrimonio y paseo marítimo | Casa 5 | Buena opción de visita fuera de temporada; verificar monumentos |
| Castillo Real de Collioure | Patrimonio | Castillo histórico junto al mar | Casa 5 | Consultar horarios y entradas |
| Costa Vermeille | Naturaleza / costa | Paseos costeros y pueblos del litoral | Casa 5 | Elegir itinerario según meteorología |

### 5.4. Zona D — Conflent (casas 6 y 7)

| Lugar / actividad | Tipo | Qué ofrece | Casa(s) más cercanas | Estado para diciembre |
|---|---|---|---|---|
| Villefranche-de-Conflent | Pueblo / patrimonio UNESCO | Ciudad medieval amurallada y fortificaciones de Vauban | Casas 6 y 7 | Confirmar horarios de murallas y visitas |
| Fort Libéria | Patrimonio | Fortaleza sobre Villefranche-de-Conflent | Casas 6 y 7 | Confirmar apertura, acceso y condiciones |
| Grottes des Canalettes | Naturaleza / visita | Cuevas y formaciones geológicas | Casas 6 y 7 | Consultar apertura invernal |
| Vernet-les-Bains | Pueblo / bienestar | Villa termal y punto de partida para actividades del Canigó | Casas 6 y 7 | Confirmar servicios y horarios |
| Abadía de Saint-Michel de Cuxa | Patrimonio | Conjunto monástico románico | Casas 6 y 7 | Consultar visitas |
| Reserva natural de Jujols | Naturaleza | Paisaje de montaña y patrimonio natural | Casa 7 | Senderos sujetos a condiciones invernales |
| Entorno del Canigó | Naturaleza / montaña | Paisaje emblemático de los Pirineos catalanes | Casas 6 y 7 | En diciembre no presentar ascensiones de alta montaña como plan ordinario; proponer paseos de baja cota adecuados a condiciones |
| Baños termales de Molitg-les-Bains | Bienestar | Complejo termal | Casas 6 y 7 | Consultar horarios y reservas |

### Fuentes turísticas de referencia

- Lago de Matemale y actividades: https://lesangles.com/en/service/lac-de-matemale/
- Turismo de Cerdanya — baños termales: https://cerdanya.org/es/que-hacer/turismo-de-bienestar/banos-termales/
- Actividades de invierno y verano en Pyrénées 2000: https://pyrenees2000.com/activites/
- Turismo Conflent Canigó: https://www.conflentcanigo.fr/tourisme
- Turismo de Villefranche-de-Conflent: https://villefranchedeconflent.fr/tourisme/
- Turismo Vallespir: https://www.vallespir-tourisme.fr/es/practico/folletos/
- Turismo de Prats-de-Mollo-la-Preste: https://www.pratsdemollolapreste.com/sejourner/
- Turismo oficial de Collioure: https://www.tourisme-collioure.com/

## 6. Reglas de calidad de los datos

1. Nunca inventar precios, distancias, valoraciones, servicios ni disponibilidad.
2. Diferenciar «no disponible», «no incluido» y «no se ha podido verificar».
3. Conservar el enlace original de cada anuncio.
4. Los precios se muestran siempre asociados al número de personas (6 o 7) para el que se han calculado.
5. No tratar la nota media como comparable sin el número de evaluaciones.
6. No mostrar servicios estacionales como disponibles fuera de temporada.
7. Señalar contradicciones del anuncio (ejemplo: dormitorios de Casa 1).
8. Los precios deben ser comparables: misma estancia, mismo número de viajeros y mismos conceptos incluidos.
9. Comparar las valoraciones de Booking (sobre 10) y Airbnb (sobre 5) solo tras normalizar la escala.
10. Actualizar las condiciones de reserva antes de tomar una decisión, porque los anuncios pueden cambiar.

## 7. Pendientes para la web

- [ ] (Futuro) Decidir si se activa la votación y con qué base de datos.
- [ ] Activar la previsión del tiempo (`config.meteoActiva = true`) a finales de noviembre de 2026.
- [ ] Indicar la URL pública de GitHub Pages (`config.urlPublica`) para la vista previa al compartir.
- [ ] Confirmar horarios y apertura de actividades para el puente de diciembre de 2026.
- [ ] Decidir si el grupo tendrá coche(s) y cuántos (afecta a los tiempos de conducción del mapa).
- [ ] Cuando se confirme si seremos 6 o 7, decidir si se oculta la columna de precios que no aplique y se retira el aviso «Falta confirmar si som 6 o 7».

## 8. Instrucción final para Claude

Construye la web en catalán usando `casas.md` como fuente de verdad para los datos de los alojamientos y este documento para la estructura y la experiencia. No sustituyas los campos pendientes por información inventada. Prioriza una experiencia de comparación excelente en móvil y escritorio, con los precios para 6 y 7 personas siempre visibles, la tabla resumen y el mapa de ubicaciones como elementos centrales. La web se publicará en GitHub Pages; la votación debe quedar oculta y desactivada (sección 4.8), lista para activarse en el futuro. La sección de actividades debe complementar la elección del alojamiento y respetar la agrupación geográfica de las casas. Mantén el código, los datos y los componentes claramente separados para que actualizar precios, condiciones, casas y actividades sea sencillo.

Antes de publicar, comprueba todos los enlaces, los precios para las fechas exactas, el número de huéspedes, las condiciones de estancia mínima y la disponibilidad.
