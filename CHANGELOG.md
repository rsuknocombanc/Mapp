# CHANGELOG
## [Unreleased] — v0.3 artística (MAP-0002)
- Bosques con estampados Canvas sobre polígonos geográficos y selector dinámico.
- Relieve hillshade 2D con DEM opcional.
- Ajustes de papel, tipografía, UI y fallback de carga.
- Pendiente validación real Safari y aprobación de diseño.

## [0.3.1] — Cotas + lugares (experimental)
- Sustituye textura forestal periódica por color-relief de altitud DEM, preservando geografía.
- Bandas hipsométricas con paleta ilustrada y hillshade suave.
- Desactiva extrusiones de edificios y baja su peso visual.
- Incorpora buscador Photon con resultados georreferenciados, marcador propio y manejo de errores.
- Pruebas estáticas y de interfaz simulada; Safari real pendiente.

## [Unreleased] — v0.4 atlas plano y rutas
- Sin DEM ni hillshade; acuarelas vectoriales ligeras en bosques y agua, papel crema.
- Vías principales raya-punto; detalle secundario según zoom.
- Rutas OSRM automáticas y trazado libre, waypoints, búsqueda y GPS opcional.
- UAT real Edge/Safari pendiente.

## [Unreleased] — v0.4.1 refinamiento de pigmentos (MAP-0006)
- Verde oliva profundo y agua petróleo, acordes a referencia manual.
- Bosque y agua con tintas más densas y segunda aguada clara de baja intensidad.
- Bordes con doble línea: halo difuso y sobreimpresión discontinua de pastel, además de trazos secos en vías principales y ruta activa.
- Conserva rutas automáticas OSRM, trazado libre, búsqueda Photon, GPS y mapa 2D; no introduce nuevas fuentes DEM.
- Contrato/JS/rutas/Chromium simulado OK; UAT real en Edge y Safari pendiente.

## [Unreleased] — v0.5 Árboles ilustrados (MAP-0007)
- 8 variantes originales de coníferas y pequeños grupos, con facetas tipo pastel pintadas por Canvas; tres paletas coherentes con el mapa.
- Posición determinista georreferenciada dentro de polígonos de vegetación OpenMapTiles, con huecos, densidad por tipo y nivel de zoom; sin wallpaper repetido.
- Capa de símbolos antes de vías y rutas, iconos límites por viewport (130 móvil, 260 PC), actualización diferida y fallback.
- Rutas manuales y automáticas, búsqueda, GPS, Jimny, agua y papel plano conservados.
- Node sintaxis y tests geometría/rutas/contrato, Chromium UI simulado OK; UAT real Edge/Safari pendiente.

## [Unreleased] — v0.5.1 diagnóstico en capturas (MAP-0008)
- Etiqueta esquina superior derecha con versión v0.5.1, tema activo, zoom y cantidad de pinos generados.
- Callback local para recuento de símbolos; no se envían datos, sin GPS ni dependencia adicional.
- UAT pendiente para fidelidad artística MAP-0007; esta revisión no modifica la generación de árboles.

## [Unreleased] — v0.6.0 atlas acuarelado definitivo (MAP-0009)
- Estilo único: acuarela, bosque y tinta integrados. Se eliminan las tres opciones del panel.
- Ocho pinos aprobados en acuarela en atlas PNG transparente (24 variantes leves de tono), un solo archivo ≈294 KB.
- Densidad visible ampliada sobre bosques (~32 px frente a 72 px), cobertura adicional de praderas/parques más dispersa, límite móvil/escritorio y posiciones geográficas estables.
- Papel cálido, bosque oliva intenso, agua azul petróleo oscuro y caminos óxido; rutas y búsqueda conservadas.
- Pruebas estáticas, geometría y Chromium simulando MapLibre superadas; Safari/Edge con teselas reales pendientes.
