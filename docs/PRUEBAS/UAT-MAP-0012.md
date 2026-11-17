# PLAN DE PRUEBAS MAP-0012 — Limpieza cartográfica
Fecha: 2026-11-17. Estado: PROPUESTO, sin ejecución.
| ID | Prueba | Resultado esperado |
| --- | --- | --- |
| P01 | `water.class=swimming_pool` en fuente real | 0 objetos renderizados en water y 4 overlays |
| P02 | `water.class=lake/ocean/river` | Agua conservada |
| P03 | `water.class=pond`, z12 y z15 | Oculta en 12 y visible en 15 |
| P04 | `track` vs `service`, z12 | Track visible, servicio no |
| P05 | `path` vs `pedestrian`, z13 | Sendero visible, peatonal urbano no |
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

Sin resultados de estas pruebas se mantiene estado PENDIENTE UAT. Nunca confundir validación de estilo con render real.
