# Mapp v0.4 — Atlas artístico plano

Prototipo web de mapas personalizados. Fondo de papel, vegetación y agua con transparencias superpuestas como aguadas cartográficas (no acuarela vectorizada de alta fidelidad); sin DEM, 3D ni edificios extruidos. Conserva mapa real de OpenStreetMap/OpenFreeMap, búsqueda Photon, GPS opcional y marcador Jimny.

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