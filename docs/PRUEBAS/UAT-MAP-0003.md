# UAT MAP-0003 — Prototipo artístico y búsqueda
Estado: PENDIENTE. Ejecutor objetivo: usuario en Safari iPhone.
- [ ] La URL HTTPS carga cartografía vectorial y bandas de cota de elevación reales.
- [ ] Cambiar de estilo cambia los tonos de elevación.
- [ ] No aparecen bosques repetidos como textura ni edificios 3D.
- [ ] Agua, vías, puntos de interés y nombres siguen visibles.
- [ ] Buscar nombre de lugar (ej. Cajón del Maipo), mostrar lista y centrar con marcador independiente del Jimny.
- [ ] Mostrar un error comprensible sin detener mapa cuando Photon no responde.
- [ ] GPS exige permiso del usuario y no expone la posición en logs de la app.
- [ ] Rendimiento al acercar/alejar y cambiar estilos aceptable en iPhone Safari.
- [ ] Confirmar correcta atribución de OpenStreetMap, OpenFreeMap y Mapterhorn.
## Evidencia técnica obtenida (no equivale a UAT)
Node `--check` del script JS: OK. Tests Python del contrato HTML/JS: OK. Navegador Chromium simulado con MapLibre y Photon falsos: crea dos capas (color-relief y hillshade), oculta extrusión, permite cambio de estilos y búsqueda/selección sin errores JS. No hay evidencia todavía de teselas ni geocodificación real en Safari.
