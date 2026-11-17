# Mapp v0.7.0 — Atlas de acuarela, bosque ilustrado y tinta

Prototipo web de mapas personalizados. Fondo de papel, vegetación oliva de pigmento más concentrado, agua azul petróleo y contornos de pincel seco simulados con dos pasadas de tinta (no acuarela vectorizada de alta fidelidad); sin DEM, 3D ni edificios extruidos. Conserva mapa real de OpenStreetMap/OpenFreeMap, búsqueda Photon, GPS opcional y marcador Jimny.

## Rutas
- **Por caminos**: seleccionar A y B tocando el mapa, opcionalmente puntos intermedios, pulsar **Calcular**. Usa el servidor público de demostración OSRM (perfil `driving`), no determina accesibilidad 4×4, peajes, cierres, barro ni navegación giro a giro; no apto para producción. Los puntos elegidos se transmiten a OSRM al calcular.
- **Trazado libre**: seleccionar puntos sucesivos sin servidor de rutas; conecta segmentos rectos y calcula distancia aproximada. **NO** implica que exista camino o permiso de acceso.
- El buscador Photon permite localizar lugares y seleccionar origen/destino mientras está abierto el panel de rutas.
- Ruta seleccionada rojo oscuro discontinuo con borde claro. Vías principales trazo raya-punto; callejones y calles locales aparecen con mayor zoom.

## Probar
Abrir la URL publicada por GitHub Pages (HTTPS). En PC, DevTools de Edge para rendimiento; luego Safari iPhone. Para pruebas estáticas: `python tests/check_contract.py && node --check assets/app.js`. La suite simulada `python tests/browser_mock.py` requiere Playwright + Chromium en local.

## Conexiones
MapLibre JS 5.7.1 desde unpkg; OpenFreeMap / OpenStreetMap; Photon; OSRM demo. Se requerirá un backend/plan de proveedores para uso comercial o carga significativa y para rutas off-road verificadas. Sin servicios offline todavía.

## Gobierno
Consultar `AGENTS.md`, `METODOLOGIA.md`, `docs/CONTEXTO.md`, `docs/BITACORA.md`, `docs/REQUERIMIENTOS/MAP-0004.md`, `MAP-0005.md`, y planes UAT. `main` estable; preview por `gh-pages`, sin merge automático.

## Refinamiento visual 0.4.1
- Referencia cromática: ilustración manual del usuario (verde oliva intenso, agua gris petróleo).
- Sobreimpresiones geográficas traslúcidas y contornos quebrados sobre los polígonos de bosque y agua; trazo secundario descontinuo sobre vías principales y ruta. No se repiten imágenes de árboles ni se añade relieve.
- La textura de pastel es una aproximación vectorial, no un renderizado de pincel físico; verificar en Edge y Safari sobre cartografía real.
- La optimización de carga dependerá de un UAT posterior; se agregan pocas capas, se evita DEM.

## Bosques ilustrados georreferenciados — MAP-0007 (experimental)
- Ocho sprites de coníferas y pequeños grupos **dibujados originalmente con Canvas**, con facetas de pigmento y trazos tipo pastel. No son activos de Firewatch.
- Posiciones ancladas a una cuadrícula Mercator con semilla determinista y enmascaradas por polígonos reales de `openmaptiles.landcover` (bosques), con distribución ilustrativa baja en parques/praderas. No constituye inventario de árboles.
- Densidad/escala ajustadas por zoom, presupuesto máximo de 130 símbolos en viewport móvil y 260 en escritorio, actualización diferida al mover mapa y sólo en región cargada. El cambio de nivel de detalle puede reorganizar símbolos al cruzar un nivel de zoom entero.
- Árboles debajo de calles, etiquetas y rutas, sin interferir con GPS, Jimny, buscador y trazado. Fallback sin árboles si fallan imágenes/capas.
- Cambiar Acuarela/Bosque/Tinta recolorea los árboles y conserva geometría de bosque.
- Validar en Edge y Safari reales: este es un prototipo, no acuarela pintada manualmente ni cobertura global de alta precisión.

## Atlas visual unificado v0.6.0 — MAP-0009
- **Una sola estética:** acuarela para masas naturales y agua, bosque con árboles pintados y tinta para caminos/rutas. No hay selector de temas.
- **8 pinos aprobados** por el usuario en acuarela, recortados con transparencia de la lámina generada y convertidos en 24 variaciones leves de pigmento. `assets/trees/watercolor-atlas.png` incluye el recurso comprimido (una descarga ≈300 KB).
- Separación entre muestras forestales reducida a ~32 px por zoom; sobre bosques OpenMapTiles la densidad es alta y sobre parques/praderas más dispersa. Dato ilustrativo, **no** certifica presencia de pinos en un lugar.
- Paleta: papel `#EFDEB9`, bosque `#6B8652`, agua `#265D65`, tinta/óxido `#9B5737`. MapLibre sigue siendo mapa real con búsqueda, GPS y rutas.
- En la esquina superior derecha se informa `v0.6.0`, `ATLAS`, zoom y símbolos de pino generados. Datos geográficos propios no se transmiten a nuevos servicios; siguen las limitaciones externas de Photon y OSRM.
- Pruebas: Python contrato, Node sintaxis, geografía y rutas, Chromium simulado con **PNG auténtico** decodificado. UAT pendiente sobre teselas reales Edge y Safari; no se ha comprobado el rendimiento real ni la equivalencia total con la maqueta aprobada.
## Corrección v0.6.1 — pinos visibles
Se corrige la expresión `icon-size` de la capa MapLibre `mapp-tree-symbols`: el zoom debe ser el operador externo de `interpolate`, con el multiplicador individual `scale` dentro de cada parada. En v0.6.0 los pinos estaban generados y el atlas cargado, pero MapLibre rechazaba la capa; el contador no equivalía a árboles visibles. Se añade prueba con el validador oficial MapLibre Style Spec además de las pruebas simuladas. Ver MAP-0010 y ADR-0010. Safari y Edge reales pendientes de UAT tras esta publicación.

## v0.7.0: composición pictórica por nivel de zoom
Zoom regional con pinos finos, densos y agrupados mediante ruido suave georreferenciado; zoom cercano con tamaños mayores y claros. Contornos forestales, pastos y parques suavizados mediante veladuras `line-blur`, conservando caminos, rutas y coordenadas. Requiere UAT Edge/Safari con cartografía real.

## v0.8.0 — Política de limpieza cartográfica (MAP-0012)
La vista atlas filtra piscinas privadas en cinco capas de agua, oculta estanques hasta zoom 14, elimina decoración urbana redundante y pasajes peatonales urbanos, conserva senderos rurales y huellas 4x4 con umbrales propios. Muestra líneas comunales `admin_level=8` de Chile desde zoom 11 **si la fuente vectorial contiene la geometría**; el diagnóstico devuelve «not-observed» si no hay datos en las tiles actuales, no extrapola cobertura nacional. Política versionada y reversible, preserva rutas, Jimny y búsqueda. UI real Edge/Safari pendiente de aceptación.
