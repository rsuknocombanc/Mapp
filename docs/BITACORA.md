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

## Continuidad
Revisar Pull Request #1 con prototipo artístico v0.3; revisar CI, preview de gh-pages y UAT en Safari real. No modificar main sin autorización de merge. Documentar feedback artístico y resolver errores reales de capas.
