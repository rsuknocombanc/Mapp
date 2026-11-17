# PLAN DE PRUEBAS MAP-0012 — Limpieza cartográfica
Fecha: 2026-11-17. Estado: PLAN D1 APROBADO; implementación v0.8.0 autorizada; CI automatizado previsto y UAT Edge/Safari pendiente.
| ID | Prueba | Resultado esperado |
| --- | --- | --- |
| P01 | `water.class=swimming_pool` en fuente real | 0 objetos renderizados en water y 4 overlays |
| P02 | `water.class=lake/ocean/river` | Agua conservada |
| P03 | `water.class=pond`, z12 y z15 | Oculta en 12 y visible en 15 |
| P04 | `track` vs `service`, z12 | Track visible, servicio no |
| P05 | `path` vs `pedestrian`, z12, z16, z18 | Sendero rural visible; peatonal urbano oculto en TODOS los zoom y puentes/túneles |
| P06 | Vías locales, z11 y z15 | Oculta al alejar, recuperada al acercar |
| P07 | Polígonos escuelas/hospital/cementerio/canchas | No colorean el mapa |
| P08 | Etiquetas de ciudades/pueblos/agua y carreteras | Legibles sin exceso de POI |
| P09 | Ruta OSRM y trazado libre | Linea seleccionada arriba de todo |
| P10 | `MapLibre Style Spec` / filtros / expresiones | Sin error; control negativo falla |
| P11 | Safari iPhone + Edge Windows | Interacción y legibilidad preservadas |
| P12 | Cambio proveedor/IDs desconocidos | Advertencia y degradación segura |
| P13 | `applyPolicy` ejecutado 2 veces | Idempotente, sin duplicar capas |
| P14 | Rendimiento antes/después | Medición real de FPS, memoria/carga |
| P15 | Buscar lugar, GPS voluntario y Jimny | Sin regresión |
| P16 | Límite comunal chileno en z11, z13 y z16 | Línea real de `admin_level=8` tenue, discontinua y sin relleno |
| P17 | Disponibilidad `admin_level=8` en las teselas OpenFreeMap | Verificar con fuente/objeto sobre frontera comunal conocida; si falta, registrar bloqueo sin inventar geometría |
| P18 | Pasajes urbanos `class=pedestrian`, z12–18 | Invisibles en todos los zoom; `path` y `track` rural intactos |
| P19 | Superposición frontera comunal/carretera/ruta | La línea comunal no tapa ruta seleccionada ni se confunde con frontera internacional |

Sin resultados de estas pruebas se mantiene estado PENDIENTE UAT. Nunca confundir validación de estilo con render real.

## Evidencia y limitaciones
Se ejecutarán pruebas unitarias de filtros y capas, restauración/idempotencia y validación oficial MapLibre. Una simulación de provider no certifica cobertura real de límites comunales, ni ausencia de rectángulos azules por datos incorrectamente clasificados, ni FPS en Safari. Para P16/P17, sobre una frontera comunal real usar diagnóstico `window.MappLayerPolicy.inspectCommuneCoverage(map)` después de cargar tiles; `not-observed-in-current-tiles` NO demuestra ausencia global. P01–P19 requieren UAT antes de cerrar.

## Ejecución CI y preview (17-11-2026)
- `tests/check_contract.py`, `tests/test_route_logic.js`, `tests/test_forest_logic.js`, `tests/test_layer_policy.js`: ejecutados en CI [44197653532](https://github.com/rsuknocombanc/Mapp/actions/runs/44197653532), **PASS**.
- `tests/test_tree_style.js`, `tests/test_policy_style.js`: validador oficial `@maplibre/maplibre-gl-style-spec@26.4.4`, incluyendo control negativo, **PASS**.
- [Pages 44197870495](https://github.com/rsuknocombanc/Mapp/actions/runs/44197870495) **SUCCESS** para commit `801fa5941407ec452b401a6e2890b123e4ba1897`, preview v0.8.0.
- **P01–P19 permanecen pendientes de comprobación visual/funcional REAL en Edge/Safari**; tests de lógica acreditan expresiones/código, no cobertura efectiva de `boundary.admin_level=8` ni rendimiento Safari. No afirmar UAT ejecutada con cartografía real.
