# UAT MAP-0006 — Color, textura y legibilidad v0.4.1
Estado: pendiente UAT de usuario.

- [ ] Con estilo Acuarela: papel crema, masa forestal verde oliva intenso y agua azul petróleo, contraste perceptiblemente mayor que v0.4.
- [ ] Estilo Bosque: vegetal más profundo que Acuarela; Tinta: más discreto, sin perder agua reconocible.
- [ ] Bordes de bosque y agua se sienten dibujados, con quiebres ligeros; no se ve un patrón periódico de papel mural.
- [ ] Las vías principales siguen siendo raya-punto y las calles locales aparecen por zoom.
- [ ] Ruta roja discontinua mantiene prioridad e inteligibilidad (automática y libre); no se pierde buscador, GPS y Jimny.
- [ ] No aparece DEM, hillshade ni edificios 3D.
- [ ] Verificar en Edge PC y Safari iPhone, con capturas de áreas rurales (Embalse del Yeso) y urbanas (Santiago).
- [ ] Medir fluidez y carga comparando v0.4.1; si las capas nuevas generan baja de FPS, ajustar antes de merge.

## Evidencia técnica
JavaScript node --check, tests/check_contract.py, tests/test_route_logic.js, Chromium Playwright con MapLibre, Photon y OSRM simulados: correctos, incluyendo cambio de paleta y colores efectivos. No acredita render real de tiles, servicio OSRM real ni Safari.
