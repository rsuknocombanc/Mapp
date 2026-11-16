# Bitácora Mapp
## 2026-11-16 — Inicio del proyecto
Se acuerda GitHub como fuente de verdad, Mapp para Safari iPhone, mapas personalizables y GitHub Pages con Actions. La metodología exige aprobación de diseño antes de implementar.
## 2026-11-16 — Diseño visual
Se toma como inspiración mapa vintage topográfico de aventura estilo Firewatch, con colores oliva, papel antiguo, curvas de nivel, bosques y estética ilustrada. El usuario aprueba explorar distintas versiones visuales, incluyendo vista estrictamente vertical y manchas verdes con textura.
## 2026-11-16 — Prototipo inicial
Se solicita un prototipo interactivo con marcador de Jimny visto desde arriba. Se genera HTML v0.1, pero el visor interno de ChatGPT mostró cartografía en carga. El usuario autoriza subir el trabajo y configurar publicación GitHub Pages. Se crea el repositorio oficial rsuknocombanc/Mapp y rama feature/bootstrap-vintage-map.
## 2026-11-16 — Renderizado artístico v0.3 (MAP-0002)
Aprobación explícita de implementar una pasada visual artística; objetivo: mapa de aventura retro, vista estrictamente vertical. Se utiliza la misma rama temporal feature/bootstrap-vintage-map y el PR #1, evitando proliferación de ramas.
Implementado: paleta de atlas, UI más discreta, 3 patrones de bosque generados en Canvas y aplicados a polígonos vectoriales georreferenciados mediante MapLibre fill-pattern; sombreado suave con DEM externo Mapterhorn, opcional; control de carga con mensaje de fallo. Mantiene GPS y marcador del Jimny.
Comprobaciones locales: sintaxis JavaScript con node --check; interfaz simulada en Chromium con MapLibre sustituido por mock, selección de estilo, texturas y relieve registrados sin errores JS. Estas pruebas NO equivalen a cartografía real cargada ni Safari iPhone aprobado.
Pendientes: comprobar datos y cobertura del proveedor de elevación, funcionamiento de tiles en Safari real, contraste y usabilidad, revisión/aprobación visual, merge de PR #1; Pages de prueba en gh-pages sujeto a verificar URL.

## 2026-11-16 — v0.3.1 y buscador (MAP-0003)
Usuario observa que las texturas repetidas se ven artificiales; entrega referencia propia con colores por cota y solicita explícitamente siguiente versión más buscador de lugares. Se implementa en la rama temporal `feature/bootstrap-vintage-map` y se preserva `main`.
Cambios: eliminado `fill-pattern` de bosques, bandas por elevación real DEM mediante `color-relief` MapLibre; hillshade suave; uso de suelo transparente y edificios 3D ocultos; buscador Photon con resultados seleccionables, interrupción de búsquedas obsoletas y GPS/Jimny independiente.
Bandas provisionales: 650/1150/1900/3200 m. Nuevo requerimiento MAP-0003 y ADR-0003; ADR-0002 conservado históricamente. CI ampliado con validación de JS y contrato UI; pruebas mock de Chromium locales (no Safari real). Geocodificador público sin SLA, usar prudentemente.
Próxima acción: verificar Actions CI y Pages de este commit, evaluar mapa real y búsqueda en Safari; recoger observaciones; no mergear a main sin autorización.

## Continuidad
Revisar PR #1 con v0.3.1 MAP-0003; CI, Pages, búsqueda Photon y UAT Safari pendientes. Mantener main y documentación coherentes. Priorizar feedback de elevación por cotas, fluidez y buscador.
