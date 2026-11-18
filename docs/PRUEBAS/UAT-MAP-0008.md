# UAT MAP-0008 — Versión e información contextual
Estado: pendiente pruebas reales de usuario.
- [ ] Al iniciar se lee v0.5.1 en esquina superior derecha.
- [ ] Estilo mostrado coincide con opción seleccionada y cambia inmediatamente.
- [ ] Zoom se actualiza al acercarse/alejarse.
- [ ] PINOS refleja los puntos generados del bosque tras cargar datos; 0 significa que no se generaron candidatos, no demuestra ausencia de vegetación real.
- [ ] No tapa búsqueda ni brújula ni controles en Edge y Safari; legible en captura.
- [ ] Navegación manual/automática, cambio de estilo y GPS sin regresión.
Evidencia local: Python contrato, Node check, tests de geometría y rutas, Chromium móvil simulado: OK. Sin validación real de teselas ni Safari.
