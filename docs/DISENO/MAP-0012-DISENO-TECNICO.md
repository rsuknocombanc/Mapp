# MAP-0012 — Diseño técnico de política de visibilidad cartográfica
**Versión del documento:** propuesta D0 · 2026-11-17
**Estado:** PROPUESTO / PENDIENTE APROBACIÓN TÉCNICA (no implementado)
**Referencia:** `docs/REQUERIMIENTOS/MAP-0012.md`, issue #5, Mapp v0.7.0, PR #1.

## 1. Baseline verificado

- Mapp es HTML + MapLibre GL JS 5.7.1. `assets/app.js` inicia el estilo externo `https://tiles.openfreemap.org/styles/liberty`, lo modifica dinámicamente con `artStyle()`, añade acuarelas con `addArtWashes()`, y encima árbol, trazador, buscador y Jimny.
- El **estilo de referencia** `hyperknot/openfreemap-styles/styles/liberty/style.json` (rama main consultada 2026-11-17) contiene 111 capas en 15 grupos; no se verificó que el contenido entregado en tiempo real por el endpoint sea idéntico, por lo que se requiere inspección `map.getStyle().layers` en Edge/Safari antes de un cambio.
- Mapp agrega 13 capas de acuarela sobre fuentes `landcover`, `park` y `water`, una sobreimpresión de caminos, una capa de símbolos forestales y cinco componentes de ruta. Los sprites de pinos ya tienen validación MapLibre (ADR-0010).
- En `artStyle()` existen reglas demasiado amplias por fragmento de ID (`water`, `landuse`, `road`), capaces de colorear áreas de interés secundario.

## 2. Decisión arquitectónica propuesta: política declarativa en etapa piloto

Crear `assets/layer-policy.js`, un módulo simple independiente de búsqueda y rutas, que reciba un objeto MapLibre listo. Exponer `applyPolicy(map, policy)` y `validatePolicyAgainstStyle(style, policy)`.
- Mantener Liberty y OpenFreeMap durante este piloto. Evitar reescribir inmediatamente las 111 capas, operación de mayor riesgo y alcance.
- Catálogo de **IDs exactos** de capas base; usar los atributos `source-layer`, `class`, `brunnel`, `ramp` y `oneway` donde correspondan. Desconocidas: no ocultar automáticamente; registrar advertencia diagnóstica sin coordenadas.
- Aplicar luego de `artStyle()` y `addArtWashes()`, **antes** de instalar árboles y ruta. Si se sustituye el estilo del mapa, volver a aplicar la política al completarse el nuevo `style.load`, una sola vez por carga; no escuchar cada evento `render`/zoom para ejecutar filtros.
- Usar `setLayoutProperty(id,'visibility','none')` para categorías apagadas, `setLayerZoomRange(id,min,max)` para límites por escala, `setFilter` para tipo de entidad, y propiedades `fill-opacity`/`line-opacity` con `step(zoom)` de nivel superior cuando se necesite combinar escala y atributo.
- Snapshot de filtro y propiedades originales para restauración/rollback; no sustituir un filtro base sin incorporar su expresión. Evitar expresiones de cámara ilegales (recordar bug MAP-0010).
- No alterar `map.getSource('openmaptiles')`, ni borrar `source-layer` del mapa. Si se introducen capas de separación por clase, conservar source y filtro originales.

Se considera **en una fase posterior, con aprobación independiente**, generar un JSON de estilo propio de Mapp desde un catálogo versionado, en lugar de modificar el Liberty del proveedor. No forma parte de la primera implementación MAP-0012.

## 3. Tabla de reglas propuesta (por IDs exactos)

| Categoría o IDs Liberty | Política | Condición |
| --- | --- | --- |
| `background` | Mantener | Siempre, papel Mapp |
| `natural_earth` | Mantener oculto | Ya oculto por Mapp; no añadir relieve |
| `park` | Mantener | Lavar en acuarela, sin borde lineal duro |
| `park_outline` | Ocultar | Limitar líneas poligonales rígidas |
| `landuse_residential`, `landuse_pitch`, `landuse_track`, `landuse_cemetery`, `landuse_hospital`, `landuse_school` | Ocultar | Terreno vuelve al papel, sin ocultar nombres de localidad |
| `landcover_wood`, `landcover_grass`, `landcover_ice`, `landcover_wetland`, `landcover_sand` | Mantener | Respetar clases naturales con veladuras |
| `waterway_river` | Mantener | Río y estero; no filtrarlo por piscina |
| `waterway_other` | Por zoom | 12+ para esteros/canales secundarios; verificar clase real |
| `waterway_tunnel` | Ocultar o muy discreto | Revisar si aporta referencia de acceso |
| `waterway_line_label` | Mantener | Preferentemente 12+; evitar saturación |
| `water` | Filtro de clases y escala | Excluir `swimming_pool`; `pond` no visible antes de z14 |
| `aeroway_fill`, `aeroway_runway`, `aeroway_taxiway`, `airport` | Ocultar | Aeropuertos y detalles fuera del foco atlas |
| `road_motorway`, `road_trunk_primary`, `road_secondary_tertiary` y equivalentes de puente/túnel | Mantener | Carreteras y conexiones clave, tinta simplificada |
| `road_minor` y puentes/túneles de clase `minor` | Zoom | z14+; conservar calles para contar giros |
| `road_service_track`, `bridge_service_track`, `tunnel_service_track` | **Dividir por atributo** | `class=track` desde z11, `class=service` desde z15; no esconder huellas 4x4 |
| `road_path_pedestrian` y equivalentes de puente/túnel | **Dividir por atributo** | `class=path` desde z12, `class=pedestrian` desde z16 |
| `road_motorway_link`, `road_link` y equivalentes | Zoom | z13+ (conectores importantes), sin casing innecesario |
| IDs `*_casing`, `*_hatching`, `road_area_pattern` | Ocultar | Suprimir duplicación de dibujo, conservar vía estructural |
| `road_major_rail`, `road_transit_rail` y puentes/túneles ferroviarios | Ocultar inicialmente | Revisar si es una referencia útil para zonas remotas |
| `road_one_way_arrow`, `road_one_way_arrow_opposite` | Zoom | z17+; posible orientación urbana, no vista regional |
| `building`, `building-3d` | Ocultar | Mantener 3D desactivado; edificios 2D detallados requieren capa nueva y aprobación aparte |
| `boundary_3` | Ocultar | Límite administrativo subnacional |
| `boundary_2`, `boundary_disputed` | Mantener discretos | Contexto internacional y tratamiento neutral de líneas disputadas |
| `water_name_point_label`, `water_name_line_label` | Mantener | Sin piscinas; prioridades hidrográficas |
| `poi_r20`, `poi_r7`, `poi_r1`, `poi_transit` | Ocultar | Comercio genérico no relevante; POIs curados se diseñan aparte |
| `highway-name-major`, `highway-shield-non-us` | Mantener | Identificación de carreteras, z12 y z8 respectivamente |
| `highway-name-minor`, `highway-name-path` | Zoom | z15–16+ para orientarse |
| `highway-shield-us-interstate`, `road_shield_us` | Sin cambio innecesario fuera de Chile | El alcance es Chile; evitar decisiones globales sin pruebas |
| `label_other`, `label_village`, `label_town`, `label_city`, `label_state`, `label_country_*`, `label_city_capital` | Mantener | Jerarquía propia por población y zoom tras comprobar atributos |

**Excepción funcional:** la ruta seleccionada, waypoints, marcador Jimny, búsqueda y GPS mantienen sus capas y prioridad visual. No se aplican filtros generales a IDs que comienzan `mapp-route-`.

## 4. Regla especial de agua (evitar piscinas azules)

La fuente OpenMapTiles `water` expone `class = ocean | river | pond | lake | dock | swimming_pool`. Mapp pinta la capa `water` de Liberty y cuatro capas derivadas sobre el mismo `source-layer`:
`mapp-water-wash`, `mapp-water-lift`, `mapp-water-edge`, `mapp-water-pastel`.

**Misma política a las cinco capas:**
- Conservar el filtro existente de cada capa, además de agregar una condición excluyente `['!=',['get','class'],'swimming_pool']` (`['all',oldFilter,exclusion]`).
- Ocultar `class=pond` bajo z14 y mostrarla a partir de z14 mediante opacidad controlada por zoom. No hay en la especificación de la capa `water` un área numérica universal que permita ocultar **únicamente** estanques pequeños sin procesamiento GIS; este umbral es una aproximación deliberada.
- Conservar `ocean`, `river`, `lake`, `dock` y ríos de `waterway`; embalses se preservan si la fuente los clasifica como `lake`.
- Aplicar zoom como operador principal `step(['zoom'])` o crear capas separadas para agua mayor/menor; el validador Style Spec debe aceptar la expresión. La política no debe mutar la definición original irreversiblemente.
- Sin fuente adicional ni consultas de red. No filtrar `waterway_river` por accidentes relacionados con piscinas.
- Si una piscina no aparece etiquetada `swimming_pool`, registrarlo como discrepancia de datos, no ampliar el filtro a cualquier polígono pequeño sin comprobar.

## 5. Regla de caminos con usos mixtos

Liberty `road_service_track` combina clases `service` y `track`, y `road_path_pedestrian` mezcla `path` y `pedestrian`. Filtrar o retrasar el ID completo podría ocultar huellas rurales, contraviniendo el requisito de navegación off-road.

Plan: reutilizar fuente `openmaptiles`/`transportation` y clonar **solo las capas mixtas** con filtros de clase distintos, conservando `brunnel` y demás restricciones originales. Definir zoom por clase, evitar duplicados y mantener el orden respecto a rutas/etiquetas. Conservar puentes y túneles de `track` y `path`, distinguiendo trazo y acceso. `road_minor` permanece desde z14 para contar cruces.

## 6. Orden de pintura y estabilidad del estilo

1. Papel `background`.
2. Superficies naturales y agua (sin piscinas).
3. Veladuras de acuarela, bosques y símbolos forestales.
4. Caminos por clase, puentes/túneles y nombres viales relevantes.
5. Localidades, nombres naturales y agua.
6. Ruta dibujada, waypoints y vehículo / controles de interfaz.

Reutilizar la misma máscara de clase para pintura base y overlays. En `artStyle()`, eliminar gradualmente reglas demasiado amplias de coincidencia de nombres (`/landuse/`, `/water/`) en los grupos aprobados; **evitar pintarlos después de aplicar la política**, porque volverían a mostrarse. Diseñar un orden idempotente: arte base -> acuarelas -> política -> pinos -> rutas.

## 7. Matriz de zoom (diseño propuesto)

| Escala | Cartografía visible | Cartografía oculta/diferida |
| --- | --- | --- |
| z0–9, vista regional | Papel, masa forestal, mar/costa, lagos/embalses, ciudades, carretera troncal, fronteras internacionales | Piscinas, estanques menores, edificaciones, cancha, pasajes, servicios, ferrocarril |
| z10–12, exploración | + secundarias, pueblos, track rural, ríos y agua nombrada | Piscinas, pond, residencial, nombres de calles pequeñas |
| z13–14, aproximación | + caminos y senderos relevantes, locales a z14, pond desde z14 | Piscinas, detalles de canchas, edificios |
| z15–16, orientación | + service y pasajes, etiquetas viales menores, caminos peatonales desde z16 | Piscinas, edificios 3D y trama comercial |
| z17+, detalle | + flechas de sentido, rótulos precisos, accesos viales | Piscinas, edificios 3D, POI comerciales; 2D solo mediante aprobación aparte |

Los umbrales son **propuestos**; la aprobación técnica puede modificarlos antes de implementar.

## 8. Contrato de módulo y extensión posterior

`assets/layer-policy.js`:
- Tabla declarativa de identificadores exactos, categorías, zoom y decisión visual `show | hide | split | filter`.
- `applyPolicy(map)`: opera después de cargar el estilo y acuarelas, verifica existencia y `source-layer`, respeta el filtro anterior, aplica la regla y retorna resumen de cambios.
- `verifyPolicy(map)`: comprueba que ninguna regla critica se omitió; compara ID y tipo, y alerta si el proveedor cambia versión; no deshabilita rutas por error.
- `restorePolicy(map)`: rollback de propiedades originales durante pruebas; en producción siempre disponible regresar a ref anterior de `gh-pages`.
- `getPolicySummary()`: recuento por grupo visible/oculto/zoom; **no registra ubicación del usuario ni contenido de GPS**.
- Se añadiría la carga del módulo desde `index.html` antes de `assets/app.js`; pruebas con `@maplibre/maplibre-gl-style-spec` y navegador real, no solamente mocks.

Se descarta por ahora migrar inmediatamente las 111 capas a un estilo nuevo independiente. Un estilo Mapp versionado podría ser una siguiente fase, sujeta a decisión y aprobación específica.

## 9. Pruebas y criterios de aceptación

**Automáticas**
- Dada una entidad `water.class=swimming_pool`, ninguna de las cinco capas de agua debe representarla; ríos, lagos, océanos y embalses permanecen.
- `pond` oculto a zoom 12 y visible a 15; pruebas expresiones zoom con Style Spec oficial.
- `track`/ `path` visibles a la escala aprobada; `service`/`pedestrian` diferidos, incluyendo puente/túnel; no duplicar geometrías.
- Capas sobrepuestas (acuarelas) nunca recrean objetos ocultos del estilo base.
- La ruta OSRM demo y el modo trazado libre usan sus fuentes y capas originales; búsquedas, GPS e interacción conservados.
- `applyPolicy` idempotente y seguro si una capa no existe; sin errores WebGL por filtros rechazados.
- Detección de diferencia entre catálogo Liberty de referencia y capas del estilo recibido en producción.

**UAT real**
- Santiago z15: desaparecen rectángulos azul petróleo de piscinas, no desaparecen canales/ríos.
- Santiago z9–11: desaparece saturación residencial, comercial y deportiva.
- Farellones/Cajón del Maipo z12–16: `track` y senderos siguen visibles; camino asfaltado, accesos y ruta se leen sin confusión.
- Embalse del Yeso y costa z9–14: agua mayor permanece y mantiene paleta; etiquetas geográficas correctas.
- Edge Windows y Safari iPhone: comparar imágenes antes/después, verificar tiempo de carga, desplazamiento y FPS. No afirmar mejoras de rendimiento sin medición; ocultar una capa no reduce necesariamente la descarga de tiles.
- Revisar al menos un conjunto de filtros con `queryRenderedFeatures` real, sin exportar coordenadas personales.

## 10. Comp puertas y despliegue

Estado actual: solo criterios funcionales aprobados; **arquitectura, umbrales y módulo son propuestas**. El diseño debe recibir aprobación específica. Posteriormente autorización de implementación. Se trabajaría en `feature/bootstrap-vintage-map` / PR #1, CI con validador real, preview automatizada `gh-pages` solo tras checks verdes, UAT y, finalmente, aprobación de merge. `main` permanece estable.

## Apéndice A — Inventario de las 111 capas del estilo Liberty de referencia

Este apéndice indica IDs exactos en el repositorio de referencia; es obligatorio contrastarlos con `map.getStyle().layers` en el estilo realmente servido antes de tocar producción.

| Fuente/layer | Nº | IDs de capas |
| --- | ---: | --- |
| `(base)` | 2 | `background`, `natural_earth` |
| `park` | 2 | `park`, `park_outline` |
| `landuse` | 6 | `landuse_residential`, `landuse_pitch`, `landuse_track`, `landuse_cemetery`, `landuse_hospital`, `landuse_school` |
| `landcover` | 5 | `landcover_wood`, `landcover_grass`, `landcover_ice`, `landcover_wetland`, `landcover_sand` |
| `waterway` | 4 | `waterway_tunnel`, `waterway_river`, `waterway_other`, `waterway_line_label` |
| `water` | 1 | `water` |
| `aeroway` | 3 | `aeroway_fill`, `aeroway_runway`, `aeroway_taxiway` |
| `transportation` | 61 | `tunnel_motorway_link_casing`, `tunnel_service_track_casing`, `tunnel_link_casing`, `tunnel_street_casing`, `tunnel_secondary_tertiary_casing`, `tunnel_trunk_primary_casing`, `tunnel_motorway_casing`, `tunnel_path_pedestrian`, `tunnel_motorway_link`, `tunnel_service_track`, `tunnel_link`, `tunnel_minor`, `tunnel_secondary_tertiary`, `tunnel_trunk_primary`, `tunnel_motorway`, `tunnel_major_rail`, `tunnel_major_rail_hatching`, `tunnel_transit_rail`, `tunnel_transit_rail_hatching`, `road_area_pattern`, `road_motorway_link_casing`, `road_service_track_casing`, `road_link_casing`, `road_minor_casing`, `road_secondary_tertiary_casing`, `road_trunk_primary_casing`, `road_motorway_casing`, `road_path_pedestrian`, `road_motorway_link`, `road_service_track`, `road_link`, `road_minor`, `road_secondary_tertiary`, `road_trunk_primary`, `road_motorway`, `road_major_rail`, `road_major_rail_hatching`, `road_transit_rail`, `road_transit_rail_hatching`, `road_one_way_arrow`, `road_one_way_arrow_opposite`, `bridge_motorway_link_casing`, `bridge_service_track_casing`, `bridge_link_casing`, `bridge_street_casing`, `bridge_path_pedestrian_casing`, `bridge_secondary_tertiary_casing`, `bridge_trunk_primary_casing`, `bridge_motorway_casing`, `bridge_path_pedestrian`, `bridge_motorway_link`, `bridge_service_track`, `bridge_link`, `bridge_street`, `bridge_secondary_tertiary`, `bridge_trunk_primary`, `bridge_motorway`, `bridge_major_rail`, `bridge_major_rail_hatching`, `bridge_transit_rail`, `bridge_transit_rail_hatching` |
| `building` | 2 | `building`, `building-3d` |
| `boundary` | 3 | `boundary_3`, `boundary_2`, `boundary_disputed` |
| `water_name` | 2 | `water_name_point_label`, `water_name_line_label` |
| `poi` | 4 | `poi_r20`, `poi_r7`, `poi_r1`, `poi_transit` |
| `transportation_name` | 6 | `highway-name-path`, `highway-name-minor`, `highway-name-major`, `highway-shield-non-us`, `highway-shield-us-interstate`, `road_shield_us` |
| `aerodrome_label` | 1 | `airport` |
| `place` | 9 | `label_other`, `label_village`, `label_town`, `label_state`, `label_city`, `label_city_capital`, `label_country_3`, `label_country_2`, `label_country_1` |
