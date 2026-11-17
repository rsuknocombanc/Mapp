# UAT MAP-0009 — Atlas artístico con árboles acuarelados reales
**Estado:** PENDIENTE DE VALIDACIÓN DE USUARIO EN EDGE/Safari.

- [ ] Versión superior derecha `v0.6.0`, modo `ATLAS` único, `Zxx.x` y `PINOS` generados.
- [ ] El panel ARTE dice «Acuarela · Bosque · Tinta» como definición y no ofrece tres botones de estilos.
- [ ] Árboles visibles y pictóricos sobre manchas verdes en Santiago/Costa/Andes y zonas remotas, con siluetas distintas, variaciones de tono y de tamaño; aproximación a maqueta aprobada.
- [ ] Al desplazarse a igual zoom, iconos conservan anclas. Al variar zoom, densidad/escala cambian sin generar wallpaper evidente.
- [ ] Agua petróleo oscura, fondo de papel y trazos de tinta mantienen el contraste de referencia.
- [ ] No aparecen pinos sobre cuerpos de agua ni sobre territorio fuera de cobertura vegetal vectorial seleccionada.
- [ ] Rutas automáticas OSRM, trazado libre y búsqueda Photon funcionan en Edge; GPS y controles no sufren regresiones en Safari.
- [ ] Confirmar no pérdidas severas de FPS, memoria ni lag por límite de 270 símbolos móvil/480 PC. Registrar duración de carga y capturas.
- [ ] Sin DEM, 3D, ni cambios en `main`.

## Evidencia técnica obtenida (no UAT)
- `python tests/check_contract.py`, `node --check` en app.js y forest.js, tests de geometría/densidad y Haversine: superados.
- Chromium con MapLibre, Photon y OSRM simulados: **decodificó el PNG aprobado real** y registró sus 24 variantes, generó cientos de símbolos, verificó estructura UI única y rutas/buscador.
- La simulación no renderiza teselas reales OpenFreeMap; falta prueba visual de cartografía final y Safari iPhone real.