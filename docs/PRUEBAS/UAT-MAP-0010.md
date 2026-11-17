# UAT MAP-0010 — Validación de pinos v0.6.1
Estado: PENDIENTE pruebas reales.
- [x] Defecto de v0.6.0 localizado con diagnóstico usuario: source y PNG verdaderos, layer falsa.
- [ ] Prueba del validador oficial `@maplibre/maplibre-gl-style-spec@26.4.4` con expresión válida y negativa en GitHub CI, comprobar resultado de run.
- [ ] Abrir `https://rsuknocombanc.github.io/Mapp/` en Edge; etiqueta v0.6.1.
- [ ] En consola: `map.getLayer('mapp-tree-symbols')` existe y `map.queryRenderedFeatures({layers:['mapp-tree-symbols']}).length` es positivo al seleccionar una zona con bosques.
- [ ] Los árboles ilustrados son visibles, con tamaños distintos, y la ruta/caminos siguen por encima.
- [ ] Abrir en Safari iPhone; verificar sin error de estilo, sin saltos notables al mover y funcionamiento de búsqueda y rutas.
- [ ] Si los pinos aún son poco visibles, distinguir un problema posterior de paleta/densidad de la causa de capa inexistente, sin asumir resuelto el aspecto de la maqueta.
Documentación/CI no equivalen a aceptación visual.
