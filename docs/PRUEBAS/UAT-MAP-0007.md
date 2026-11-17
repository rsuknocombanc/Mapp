# UAT MAP-0007 — Bosques ilustrados v0.5

**Estado:** pendiente de ejecución real en Edge PC y Safari iPhone.

- [ ] En la vista regional Santiago/Costa/Andes, los polígonos verdes forestales tienen árboles de silueta diferenciada; el mapa sigue siendo plano, pictórico, y se aproxima a la maqueta aprobada.
- [ ] Las áreas sin vegetación/agua no reciben pinos erróneos; parques y matorrales tienen densidad marcadamente menor (ilustración, no inventario).
- [ ] Los árboles no forman wallpaper repetido y permanecen anclados al desplazar la vista en un mismo nivel de zoom.
- [ ] Acercar/alejar adapta distribución y tamaño sin bloqueos perceptibles y revela/oculta más detalles de caminos.
- [ ] Ruta automática roja, trazado libre, vías principales, etiquetas y marcador Jimny permanecen visibles por encima de los árboles.
- [ ] Los tres temas (Acuarela/Bosque/Tinta) recolorean árboles; buscador Photon, GPS voluntario y zoom siguen funcionales.
- [ ] Sin DEM, sombreado 3D, ni nuevas llamadas geográficas ajenas a OpenFreeMap (para la capa de árboles).
- [ ] Edge: medir carga, FPS de desplazamiento, memoria y repintados frente a v0.4.1. Safari: evaluar fluidez, gestos, memoria y densidad menor.
- [ ] Si faltan datos `landcover` o Canvas, el mapa y las rutas siguen utilizables.

## Evidencia técnica, NO UAT
- `node --check assets/app.js` y `assets/forest.js`: OK.
- `node tests/test_forest_logic.js`: posicionamiento determinista, polígono y huecos, solapamiento de vistas, límite de símbolos: OK.
- `node tests/test_route_logic.js` y `python tests/check_contract.py`: OK.
- `python tests/browser_mock.py`: Chromium móvil con MapLibre, Photon y OSRM falsos; 8 sprites registradas, GeoJSON generada, capa insertada bajo carreteras, cambios de tema y rutas: OK.
- No se han observado tiles reales ni Safari; el test simulado no prueba el parecido visual de mapa real.