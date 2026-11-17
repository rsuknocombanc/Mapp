# Mapp v0.5 — Atlas artístico de pigmento intenso

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
## Identificador visual v0.5.1 (MAP-0008)
Arriba a la derecha aparece la versión junto con estilo activo, zoom y número de pinos generados. Esto facilita comparar capturas de Edge y Safari: 0 pinos puede significar ausencia de polígonos compatibles, datos aún sin cargar o ausencia de candidatos en esa vista; un valor positivo significa símbolos generados, no necesariamente buena legibilidad. Es diagnóstico local y no comparte GPS.
