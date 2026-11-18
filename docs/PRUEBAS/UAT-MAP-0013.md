# UAT / Matriz de pruebas propuesta — MAP-0013 (no ejecutada)
Fecha: 2026-11-17. Estado: **BORRADOR DE DISEÑO**.

| ID | Prueba | Resultado / evidencia requerida |
| --- | --- | --- |
| V01 | Manchas orgánicas bosques z11/z14/z16 Edge | Contornos suaves, no triangulados; sin desbordes agresivos |
| V02 | Tonos de pigmento claro/medio/oscuro | 3 niveles distinguibles en masas sin discos ni estampados repetitivos |
| V03 | Transparencia copas en Safari | Centro opaco y periferia suave; no árbol hundido bajo relleno |
| V04 | Selector solo cenital | Únicamente «Conífera cenital» y «Frondoso cenital»; no pino de perfil |
| V05 | Cambio de tipo | Solo cambia tipo de copa, no coordenadas, zoom ni distribución |
| V06 | Retorno de zoom + pan | Manchas y copas no saltan; sin costuras evidentes por tile |
| V07 | Orden de capas | Fondos/pigmento < copas < vías y etiquetas < ruta/waypoints/Jimny |
| V08 | Rutas y servicios | OSRM/Photon/GPS/huellas/pasajes MAP-0012 sin regresión |
| V09 | Rendimiento Safari real | Sin freezes; documentar latencia, FPS y memoria con método e hipótesis |
| V10 | Edge real + Safari iPhone | Capturas antes/después en misma zona y 3 zoom, revisión humana |
| V11 | Cambio de proveedor / style.load | Orden invariantemente válido y mensajes claros ante capa faltante |
| V12 | Sprite PNG cenital | Fondo transparente, celdas cuadradas, 48 recortes y sin borde beige |
| V13 | Validador oficial MapLibre | Expresión válida de zoom/icon-image; caso negativo para zoom anidado |
| V14 | Mancha sobre agujeros de polígonos / agua | No se dibujan bosques en huecos ni sobre lagos, se respeta orientación geográfica |

**Estado UAT real: NO EJECUTADA.** Las dos comparaciones en conversación 2026-11-17 son imágenes conceptuales estáticas. La fuente real es OpenFreeMap/OSM y no está validado el resultado en MapLibre/Safari. Aprobación de diseño y permiso de implementar se solicitarán antes de generar una preview funcional.
