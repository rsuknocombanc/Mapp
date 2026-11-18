# Metodología operativa de desarrollo asistido por agentes — Mapas Personalizables

**Versión:** 1.0 | **Fecha:** 2026-11-15 | **Estado:** Aceptada para inicialización y gobernanza del proyecto; implementación pendiente de diseño aprobado | **Repositorio:** rsuknocombanc/Mapp (propuesto, aún no creado)  
**Producto:** aplicación web/PWA de cartografía personalizada, orientada a Safari en iPhone.  
**Stack inicial:** React, TypeScript, Vite, MapLibre GL JS, datos OpenStreetMap, proveedor autorizado de tiles/DEM (inicialmente MapTiler), GitHub, GitHub Actions, GitHub Pages.

> **Regla principal:** ningún requerimiento se pierde en el chat; ninguna solución pasa a código sin diseño autorizado; ningún cambio llega a `main` sin pruebas y trazabilidad; ningún despliegue se declara validado sin evidencia.

## 1. Propósito, alcance y principios

El objetivo es permitir que diferentes agentes retomen y ejecuten un proyecto con instrucciones inequívocas, mínimo esfuerzo operativo del dueño del producto y control de calidad continuo. La metodología gobierna requisitos, arquitectura, prototipos, implementación, pruebas, revisión, despliegue, observación, corrección y cierre.

**Principios obligatorios:**

1. **GitHub es la fuente única de verdad.** Los chats sirven para acordar; el repositorio conserva los acuerdos.
2. **Diseño antes de implementación.** Una idea, observación o propuesta no constituye autorización de desarrollo.
3. **Automatización por defecto**, con compuertas humanas exclusivamente cuando agregan valor.
4. **Separación entre hechos y propuestas:** marcar `CONFIRMADO`, `PROPUESTO`, `PENDIENTE` o `DESCARTADO`.
5. **Cambios pequeños y reversibles:** cada PR resuelve una unidad coherente y tiene plan de recuperación.
6. **Documentación y código evolucionan en el mismo PR.** No hay cambios funcionales huérfanos.
7. **Pruebas proporcionales al riesgo.** No ejecutar suites redundantes o extremadamente costosas sin beneficio; nunca ocultar fallos.
8. **Cero publicación accidental:** aprobación explícita previa que cubra el alcance y la publicación en pruebas.
9. **No inventar resultados:** una validación no ejecutada se reporta `NO EJECUTADA`.
10. **Acceso mínimo:** no registrar tokens, claves privadas ni ubicaciones personales en Git.

## 2. Arquitectura y plataformas

| Capa | Herramienta | Motivo | Restricciones |
|---|---|---|---|
| UI | React + TypeScript + Vite | prototipado rápido, tipado, build estático | el sitio se genera a `dist/` |
| Mapa | MapLibre GL JS | control de estilos y capas en navegador | probar WebGL/Safari real |
| Geodatos | OpenStreetMap | caminos, nombres, áreas | licencia y atribución |
| Tiles y elevación | MapTiler u otro proveedor habilitado | vector tiles, estilos y DEM | límites de consumo y credenciales de frontend restringidas por origen |
| Código | GitHub | historial y revisión | repositorio público para configuración gratuita simple de Pages |
| CI/CD | GitHub Actions | compilar, probar, desplegar | permisos mínimos y controles de rama |
| Sitio de pruebas | GitHub Pages | URL HTTPS abierta desde Safari | sitio visible públicamente; no datos confidenciales |
| Entorno local | VS Code + Node LTS | desarrollo y diagnóstico | bloquear versiones en lockfile |

**Límite inicial del producto:** no incluye giros de navegación, descarga masiva de mapas, mapas offline reales, cuentas de usuario ni backend. Cada capacidad requiere nuevo requerimiento y evaluación técnica/legal. Nunca prometer que un mapa 3D ilustrado se obtiene solo con un `style.json`: texturas, modelos, shaders y rendimiento son trabajos específicos.

## 3. Responsabilidades y autoridad

| Rol | Responsabilidad | Permisos de decisión |
|---|---|---|
| Dueño del producto (Renato) | define resultado, prioridades, aprueba diseño y alcance de publicación, prueba experiencia Safari | autoridad funcional final |
| Agente analista/diseñador | transforma solicitudes en requisitos verificables; propone opciones y mockups | puede proponer, no aprobar por el dueño |
| Agente desarrollador | implementa **solo** diseños autorizados; crea PR y evidencia | puede editar ramas de trabajo y solicitar revisión |
| Agente revisor/QA | contrasta PR contra requisitos, diseño, seguridad y pruebas | puede bloquear el PR y pedir correcciones |
| GitHub Actions | controles automáticos, build y despliegue | **no** decide conformidad funcional |

Un mismo agente puede ejecutar varias funciones, pero debe producir **artefactos separados** de propuesta, implementación y verificación. Un agente no puede atribuirse la aprobación del dueño.

**Advertencia de identidad GitHub:** si el agente opera con la misma cuenta que el dueño, GitHub puede impedir la autoaprobación formal de PR. En ese caso, exigir PR y checks automáticos, registrar la autorización expresa del dueño en issue/chat y **no** configurar una revisión obligatoria imposible de satisfacer; para control técnico de dos personas, añadir un segundo usuario GitHub distinto.

## 4. Convenciones e identificadores

- Requisito: `MAP-0001`, `MAP-0002`... consecutivos; inmutable, incluso si se cancela.
- Defecto: `BUG-0001`...; incidente de producción/pruebas: `INC-0001`...
- Decisión de arquitectura: `ADR-0001`...
- Documento de diseño: `DES-MAP-0001-v1.md` (el diseño aprobado conserva su versión).
- Branch efímera: `feat/MAP-0001-resumen`, `fix/BUG-0001-resumen`, `docs/MAP-0001-resumen`.
- Commit: `feat(map): ... (MAP-0001)`, `fix(gps): ... (BUG-0001)`, `docs: ...`.
- PR: `[MAP-0001] Implementar selector de estilos`.
- Reunión/aprobación: fecha ISO 8601 y enlace al issue o mensaje verificable.
- Versionado SemVer: `0.MINOR.PATCH` durante MVP; promover a `1.0.0` únicamente cuando se acuerde contrato estable.

**Ramas:** `main` es la única rama persistente y publicable; las ramas `feat/*`, `fix/*`, `docs/*` duran solo hasta merge/cierre. No mantener rama `develop` de larga duración. Si GitHub crea `master` por convención existente, elegir una única rama principal y reflejarla en workflows y documentos; no operar ambas.

## 5. Máquina de estados del requerimiento

`CAPTURADO → EN_ANÁLISIS → DISEÑO_PROPUESTO → DISEÑO_APROBADO → EN_DESARROLLO → EN_REVISIÓN → APTO_PARA_MERGE → DESPLEGADO_PENDIENTE_VALIDACIÓN → VALIDADO_CERRADO`

Estados alternativos: `BLOQUEADO`, `DEVUELTO_A_DISEÑO`, `DESCARTADO`, `REVERTIDO`. Nadie salta un estado; un `BUG` se vincula al requerimiento que afecta.

| Estado | Condición de entrada | Evidencia de salida | Responsable |
|---|---|---|---|
| CAPTURADO | solicitud nueva | issue ID y resumen sin reinterpretación | agente |
| EN_ANÁLISIS | issue creado | alcance, dependencias, riesgos, aceptación preliminar | analista |
| DISEÑO_PROPUESTO | análisis completo | mockup/prototipo + diseño versionado + matriz de impactos | diseñador |
| DISEÑO_APROBADO | aprobación textual explícita | referencia de aprobación, versión y autorización de publicación en pruebas | dueño |
| EN_DESARROLLO | diseño congelado | commits + tests + documentación | desarrollador |
| EN_REVISIÓN | PR abierto | checks, auto-revisión y checklist | revisor/CI |
| APTO_PARA_MERGE | pruebas verdes + sin desviaciones | autorización de merge cubierta por aprobación inicial o aprobación adicional | agente |
| DESPLEGADO_PENDIENTE_VALIDACIÓN | Pages publica commit | URL, SHA, número de ejecución, smoke test | CD/agente |
| VALIDADO_CERRADO | aceptación Safari | evidencia, versión, bitácora y cierre de issue | dueño/agente |

## 6. Flujo completo con compuertas (G0–G9)

### G0 — Apertura de sesión / recuperación de contexto

Al **abrir cualquier chat o sesión**, antes de planificar o modificar código:

1. Identificar nombre y URL exacta del repositorio, rama por defecto y commit HEAD. Si no se conocen, no fingir acceso: recuperar mediante conector GitHub o solicitar solo el dato imprescindible.
2. Leer en este orden: `AGENTS.md`, `docs/CONTEXTO.md`, `docs/BITACORA.md` (últimas entradas), `docs/REQUERIMIENTOS.md`, `docs/DECISIONES.md`, ADRs vigentes, `docs/ROADMAP.md`, último release y PRs abiertos.
3. Revisar cambios remotos recientes, issues abiertos, checks y despliegue actual. Corroborar lo que el chat indica contra Git.
4. Exponer un resumen operativo corto: versión/commit, tarea activa, estado, pendientes, bloqueos y siguiente acción permitida.
5. Nunca continuar un trabajo a partir solo de la memoria conversacional si Git contradice el dato.

**Salida:** contexto validado. Si hay divergencia, registrar `INC` o comentario de reconciliación antes de editar.

### G1 — Captura de requerimiento

Toda solicitud se registra en un issue y un archivo `docs/requerimientos/MAP-XXXX.md` usando la plantilla. Campos mínimos: problema, objetivo, usuario, experiencia esperada, valor, alcance IN/OUT, reglas, escenarios, criterios de aceptación verificables, impacto de datos, diseño, restricciones, dependencias, prioridad, riesgos y origen.

**Reglas:**
- Preservar el texto literal relevante y separar interpretación de requisito confirmado.
- Una observación puede producir un issue `PROpuesto`, **no** iniciar ejecución.
- Cambios sobre requisitos existentes registran revisión, autor, fecha y motivo; no borrar decisiones anteriores.
- Si la solicitud contiene varias capacidades independientes, crear requisitos vinculados; evitar PR gigantes.

**G1 pasa** cuando no quedan ambigüedades que cambien el comportamiento que se implementaría.

### G2 — Análisis de impacto y factibilidad

El agente inspecciona implementación, requisitos, ADRs y restricciones de proveedor. Entrega: componentes afectados, compatibilidad API, accesibilidad, rendimiento en Safari, geolocalización, atribuciones, licencias, seguridad, dependencias y coste operativo aproximado. Compara al menos dos opciones si la decisión afecta la arquitectura; recomienda una, explicando riesgos y reversibilidad.

Categorizar riesgo:
- **Bajo:** copy, estilos de color sin cambio de datos, ajustes locales de UI.
- **Medio:** nuevas capas, persistencia local, geolocalización, cambios de controles.
- **Alto:** proveedores, claves, datos personales, routing, caching offline, despliegues o arquitectura.

Cambios de alto riesgo requieren ADR y plan de rollback antes del desarrollo.

### G3 — Diseño y aprobación explícita

Entregar diseño **antes** del código: mockup mobile-first (preferencia 390 × 844 CSS px aproximados), componentes, estados de carga/error/vacío, interacción touch, estructura de capas, fuentes, leyenda, alternancia de estilos, cobertura de accesibilidad y criterios medibles. Cuando el usuario solicite una maqueta, **no** desplegar código de producción como si fuera aprobación.

Aprobación válida: frase del dueño que identifica `MAP-XXXX`, `DES-MAP-XXXX-vN` y la intención: `APROBADO PARA IMPLEMENTAR Y PUBLICAR EN PRUEBAS`. Si solo aprueba diseño, queda prohibido el merge/publicación hasta autorización adicional. La aprobación cubre **únicamente** el alcance documentado. Silencio, emojis, ideas adicionales o “se ve bien” sin intención inequívoca no autorizan publicar.

La aprobación se copia fielmente, con fecha y enlace, a requerimiento y bitácora. Congelar diseño aprobado; cambios sustantivos regresan a G2/G3 con nueva versión.

### G4 — Plan técnico y preparación de rama

1. Confirmar HEAD y que `main` esté sano; sincronizar.
2. Crear rama efímera desde `main`, nunca desarrollar directamente en rama publicable.
3. Convertir criterios de aceptación en casos de prueba numerados `TC-MAP-XXXX-01` etc.
4. Registrar archivos previstos, cambios de dependencias, scripts y migraciones.
5. Mantener modificación acotada; si surge un bloqueo de diseño, **detenerse**, informar y pedir nueva aprobación.

### G5 — Implementación controlada

- TypeScript estricto; componentes pequeños; separación `map/core`, `map/styles`, `features`, `ui`.
- No incrustar URL/clave de proveedor en lógica de vista; encapsular configuración y fallbacks.
- Respetar márgenes táctiles de iPhone, safe areas, orientación y zoom/gestos; no impedir funciones nativas.
- Registrar eventos útiles y errores técnicos sin recolectar posiciones GPS inadvertidamente.
- Mantener atribuciones visibles y licencia de tiles. No usar servidores públicos de OSM como backend de descarga masiva/offline.
- Al agregar/modificar funcionalidad, actualizar el requerimiento, diseño si aplica, matriz de pruebas, bitácora y CHANGELOG en el **mismo PR**.
- Ejecutar pruebas locales pertinentes antes de abrir PR; no ejecutar suites repetitivas sin cambios que lo justifiquen.

**G5 pasa** cuando el código satisface todos los criterios aplicables y no existen cambios funcionales no aprobados.

### G6 — Validación técnica (CI)

En cada PR, GitHub Actions debe ejecutar, en este orden:

1. `npm ci` sobre lockfile comprometido.
2. `npm run typecheck`.
3. `npm run lint`.
4. `npm run test:unit -- --run` (ajustar el script de Vitest según proyecto).
5. `npm run build` y comprobar existencia de `dist/index.html`.
6. Si existen tests de integración/e2e, ejecutarlos solo sobre cambios de riesgo medio/alto o mediante suite optimizada, sin sacrificar controles obligatorios.
7. Comprobación de trazabilidad documental: issue, requisitos, diseño aprobado, pruebas y bitácora.

**Nunca silenciar los tests rojos ni eliminar pruebas para hacer pasar CI.** Si una prueba es obsoleta, modificarla o retirarla con justificación documentada y revisión. Separar tests fallidos por datos/ambiente de defectos funcionales, sin ocultarlos. No lanzar reintentos automáticos infinitos.

### G7 — Pull request y revisión

Cada PR contiene: ID del requisito, resumen funcional, diferencia contra diseño, capturas (cuando afecte UI), matriz de aceptación, riesgos, tests ejecutados, evidencia, documentación, rollback y autorización del dueño. En revisión:

- Comparar PR contra requerimiento y diseño, no contra supuestos del agente.
- Revisar dependencia externa, contenido malicioso, secrets, claves, licencias, permisos y accesibilidad.
- Si hay riesgo de cambio visual, exigir captura en viewport móvil y, si es viable, evidencia real Safari.
- Prohibido merge con CI rojo, criterios no cubiertos o decisiones de diseño abiertas.
- Exigir PR protegido y checks; `Squash merge` para historial sencillo.

**Aprobación optimizada:** la autorización explícita de G3 puede incluir ejecución y publicación **en entorno de pruebas**, evitando pedir una segunda aprobación repetitiva **solo** si el código no se desvía del diseño, todo CI está verde y no aparece riesgo nuevo. De haber desviación o cambio de riesgo, pedir aprobación adicional antes del merge. Si hay aprobación nativa obligatoria en GitHub, respetarla.

### G8 — Integración y despliegue continuo

1. Merge por PR a `main`; GitHub Actions inicia pipeline de despliegue.
2. Repetir `npm ci`, `typecheck`, `lint`, tests y `build` sobre el commit de `main` (evita publicar un merge distinto a lo probado).
3. Configurar `base` de Vite como `/<REPO>/` para Pages de proyecto; usar `/` para Pages raíz/dominio personalizado.
4. Publicar `dist/` mediante `configure-pages`, `upload-pages-artifact`, `deploy-pages`; permisos `contents: read`, `pages: write`, `id-token: write`.
5. Concurrencia controlada para cancelar despliegues obsoletos; registrar SHA, workflow run, URL y hora.
6. Si falla publicación, incidente y rollback o reintento **único con diagnóstico**; no declarar publicado.
7. Despliegue exitoso ≠ aceptación funcional.

**Restricción:** Pages expone públicamente lo publicado; jamás colocar secretos, telemetría sensible ni información privada en `dist/`.

### G9 — Prueba Safari, cierre y aprendizaje

El agente comprueba por medios disponibles: respuesta HTTPS, recurso principal, carga de scripts, errores conocidos, funcionalidad base, atribución y estado del deployment. El dueño verifica el comportamiento **en su iPhone** cuando una prueba física no está disponible para el agente. No reportar pruebas físicas imaginarias.

Checklist mínimo Safari:
- Carga en Safari iOS, sin pantalla blanca ni error 404 de assets.
- Mapa aparece y permite zoom, drag, rotación y cambio de estilo.
- GPS solicita permiso contextual; rechazo no bloquea la app; no guardar coordenadas por defecto.
- Botones accesibles con toque, márgenes seguros, paisaje/retrato y red lenta.
- Atribuciones visibles y estilos/íconos cargan sin errores.
- Performance subjetiva y consumo de recursos aceptable; si hay 3D, comprobar fluidez y fallback 2D.

Registrar fecha, iPhone/iOS si se conoce, versión, commit, test manual, defectos y aceptación. Solo después marcar `VALIDADO_CERRADO`, actualizar `docs/RELEASES.md`, matriz y bitácora.

## 7. Política de diseño de la app cartográfica

### 7.1 Sistema visual

- Tokens de color, tipografía, espaciado, iconografía, contraste, elevación y opacidad centralizados.
- Prototipos **mobile-first**; controlar safe areas (`env(safe-area-inset-*)`), botones > 44 × 44 CSS px, lectura en sol, contraste y controles no superpuestos.
- Los estilos de mapa se definen como configuraciones versionadas e intercambiables, independientes de UI.
- Cada estilo tiene ficha: identificador, propósito, paleta, fuentes, capas, reglas de zoom, íconos, símbolos, atribución, DEM y limitaciones.
- No imitar marcas comerciales protegidas ni copiar recursos gráficos sin licencia.

### 7.2 Estilos iniciales

1. **Clásico:** caminos y nombres legibles, prioridad navegación general.
2. **Off-road:** senderos y caminos secundarios, sombreado de relieve, curvas de nivel *si la fuente las proporciona*, unidades métricas, puntos de interés relevantes.
3. **Videojuego/RPG:** lenguaje visual estilizado sobre coordenadas reales; las representaciones ilustradas no pueden falsear caminos peligrosamente. Las capas de ficción deben distinguirse de información topográfica precisa.

Para cada estilo: screenshot aprobado, archivo `style.json` o generación declarativa, matriz de capas, casos visuales por zoom, fallback en ausencia de DEM y evidencia de rendimiento iPhone.

### 7.3 Especificaciones geoespaciales

- Coordenadas: longitud/latitud WGS84; nunca invertir orden al pasar `[lng, lat]` a MapLibre.
- Fuente y fecha de actualización documentadas; no suponer exactitud rural de OSM.
- GPS requiere HTTPS/permiso; ubicación puntual solo en memoria salvo autorización explícita.
- No prometer rutas transitables por vehículos ni seguridad de senderos basándose exclusivamente en la cartografía.
- Descarga offline requiere proveedor y licencias que permitan precarga; **no** implementar precarga de tiles `tile.openstreetmap.org`.
- Atribución visible para cada fuente; costo de tiles monitoreado.
- Capas geológicas, curvas de nivel, trazas GPX y rutas son capacidades futuras, cada una con requisitos y QA propios.

## 8. Estrategia de pruebas y matriz de calidad

| Tipo | Qué verifica | Ejecutor | Momento | Bloqueante |
|---|---|---|---|---|
| Tipo/estática | tipos estrictos, lint, módulos | CI | PR y main | Sí |
| Unitarias | transformaciones, selectores, estado, fallbacks | CI | PR y main | Sí |
| Integración | MapLibre, proveedores simulados, eventos | CI cuando aplica | PR | Según riesgo |
| E2E/browser | carga de mapa, UI, navegación básica | CI o revisión programada | cambios UI/mapa | Según riesgo |
| Visual | comparación de mockups/capturas | agente + dueño | cambio visual | Sí, si cambia visual |
| Safari real | GPS, WebGL, touch, safe area, rendimiento | dueño (o device farm autorizada) | post despliegue | Sí para cierre |
| Seguridad/licencia | secrets, permisos, atribución, servicios | agente + CI | PR | Sí |
| Recuperación | volver a versión sana | agente | alto riesgo/incidente | Sí en alto riesgo |

Trazabilidad obligatoria `MAP-XXXX → aceptación CA-XX → diseño → TC-XX → PR → SHA → URL → validación`. Si faltan eslabones, el requerimiento queda abierto.

## 9. Administración del cambio

- **Corrección dentro del alcance:** versión de requisito sin cambiar diseño, con tests y bitácora.
- **Ampliación funcional:** nuevo requisito enlazado; volver a análisis y diseño.
- **Cambio arquitectónico:** nuevo ADR, comparación de opciones, migración, rollback y autorización.
- **Urgencia/bug crítico:** abrir BUG, delimitar afectación, corregir rama `fix/*`, validar y publicar por PR; no romper controles sin acuerdo excepcional registrado.
- **Propuesta futura:** registrar backlog, pero jamás implementar de manera anticipada.

Cada decisión en `docs/DECISIONES.md` y, si es arquitectónica, `docs/decisiones/ADR-XXXX.md`. Ninguna documentación antigua se borra sin reemplazo/rastro.

## 10. Versionado, releases y rollback

- `main` refleja último código **integrado**; Pages refleja último **despliegue exitoso** de esa rama; distinguirlos con SHA.
- Los cambios frecuentes de pruebas se reflejan en `0.x.y` según impacto y se registran en `CHANGELOG.md`.
- Se recomienda etiqueta anotada `v0.x.y` tras aceptación funcional, no por el mero éxito de Actions.
- Registrar en cada release: issue(s), SHA, tag, URL, build run, tests, fecha, cambios visibles y regresiones conocidas.
- **Rollback preferido:** `git revert` del merge culpable mediante PR de emergencia; CI y Pages despliegan el nuevo commit. No hacer `force push` ni reescribir historial.
- Incidente crítico: desactivar función con feature flag versionada si existe, luego investigar y documentar RCA.
- Si un proveedor de tiles falla, mostrar estado de error y opción de estilo de respaldo autorizado; no reemplazar silenciosamente por fuentes sin licencia.

## 11. Seguridad, privacidad y costos

- API keys expuestas en frontend **no son secretos**: solo usar keys diseñadas para navegador y restringidas por orígenes admitidos; jamás service tokens/credenciales administrativas en cliente.
- GitHub secrets para credenciales de servidor usadas en workflows (solo si se vuelve necesario). Revisar permisos de Actions y no imprimir tokens en logs.
- Política de datos mínimos: no enviar ubicación a servicios nuevos sin informarlo al dueño y reflejarlo en requerimiento/política de privacidad.
- No habilitar trackers/analytics por defecto; aprobarlos como nuevo requerimiento.
- No introducir dependencias sin licencia compatible y justificación.
- Establecer umbral mensual de tiles/DEM y alertas de consumo si el proveedor lo permite; registrar límites actuales antes de publicar a terceros.
- Evitar uso masivo de Actions: un CI por PR actualizado y un CD por merge; sin pruebas programadas continuas ni reruns reiterados de fallas.

## 12. Configuración inicial única de GitHub

1. Crear repositorio GitHub **público** para aprovechar Pages en plan gratuito estándar; decidir conscientemente que código y sitio son visibles.
2. Seleccionar `main` como default branch.
3. Habilitar GitHub Pages → Build and deployment → **GitHub Actions**.
4. Configurar protección de `main`: PR obligatorio, checks `CI / verify`, impedir force push/delete y requerir conversaciones resueltas; desactivar bypass cuando corresponda. Si se exige 1 aprobador de GitHub, asegurar cuenta distinta del autor del PR.
5. Habilitar squash merge y eliminación automática de rama tras merge.
6. Habilitar workflow permissions mínimos; Pages deployment puede necesitar `pages:write` y `id-token:write`.
7. Configurar proveedor de tiles y restricción de claves por dominio publicado. Para build que necesita la key pública, usar `vars.MAPTILER_API_KEY` como variable de Actions (o mecanismo equivalente); nunca usar service token en frontend. Registrar origen permitido.
8. Instalar pipeline CI y CD **una vez que exista** una app Vite con `package.json`, `package-lock.json`, scripts de QA y carpeta `dist/` generable. El kit de metodología incluye plantillas de workflow, no una app ejecutable.
9. Realizar despliegue de prueba con un mapa mínimo; validar URL en Safari antes de empezar estilos complejos.

## 13. Estructura obligatoria del repositorio

```text
/
├── AGENTS.md                 # contrato de operación de cualquier agente
├── README.md                 # instalación, arquitectura, enlaces
├── METODOLOGIA.md            # este protocolo
├── CHANGELOG.md              # cambios de versiones
├── docs/
│   ├── CONTEXTO.md           # estado actual y mapa de navegación
│   ├── BITACORA.md           # cronología de decisiones y trabajo
│   ├── REQUERIMIENTOS.md     # índice maestro y estados
│   ├── DECISIONES.md         # índice maestro ADR/funcionales
│   ├── ROADMAP.md            # prioridades, no autoriza desarrollo
│   ├── RELEASES.md           # historial de publicaciones verificadas
│   ├── requerimientos/MAP-XXXX.md
│   ├── diseno/DES-MAP-XXXX-vN.md
│   ├── decisiones/ADR-XXXX.md
│   ├── calidad/MATRIZ-PRUEBAS.md
│   ├── despliegue/RUNBOOK.md
│   └── plantillas/...
├── .github/
│   ├── ISSUE_TEMPLATE/solicitud.yml
│   ├── pull_request_template.md
│   └── workflows/ci.yml, deploy.yml
├── src/                     # aplicación tras bootstrap
├── public/
├── package.json
├── package-lock.json
└── vite.config.ts
```

## 14. Protocolos anti-errores para agentes

**Antes de modificar:**
- [ ] Leí Git y documentación de contexto completa.
- [ ] Identifiqué requisito y versión de diseño aprobado.
- [ ] Confirmé intención exacta: discutir, diseñar, implementar o publicar.
- [ ] Evalué impacto, licencias, Safari, seguridad y rollback.

**Antes de abrir PR:**
- [ ] Implementación corresponde a diseño aprobado, sin extras.
- [ ] CI local pasa o fallo reportado honestamente.
- [ ] Modifiqué requerimiento, bitácora, matriz, decisiones y changelog si corresponde.
- [ ] Añadí/ajusté pruebas pertinentes y capturas.

**Antes de merge/publicación:**
- [ ] PR tiene trazabilidad completa.
- [ ] CI remoto verde y branch protegida.
- [ ] Aprobación explícita cubre implementación y **publicación de pruebas**.
- [ ] Riesgos nuevos aprobados o inexistentes.

**Antes de cerrar:**
- [ ] Pages muestra SHA correcto y URL funcional.
- [ ] Safari real validado o marcado pendiente sin inventar resultado.
- [ ] Bug/issue cerrado con evidencia, releases y bitácora actualizados.

## 15. Protocolo de comunicación con el dueño

En cada interacción de trabajo el agente debe distinguir claramente:

- **Análisis:** hallazgos, propuestas, pendientes; **sin ejecutar cambios**.
- **Diseño:** maqueta y especificación sometidas a aprobación; **sin ejecutar desarrollo**.
- **Implementación:** código autorizado, PR, tests; informar desviaciones.
- **Publicación:** solo tras aprobación y quality gates; informar URL + SHA + resultado.
- **Cierre:** solicitar prueba Safari del comportamiento que no pueda corroborarse automáticamente.

Informe operativo breve sugerido: `MAP-ID | Estado | Diseño aprobado | Rama/PR | CI | Deploy (SHA) | Próximo paso | Bloqueos`. No afirmar que un repo está actualizado si no se consultó Git.

## 16. Criterio de aceptación de la propia metodología

Se considera implementada cuando: (a) todos los archivos existen y se usan; (b) un agente nuevo puede recuperar contexto sin leer conversaciones pasadas; (c) una solicitud genera issue/requisito/diseño; (d) se rechaza implementación sin aprobación; (e) CI bloquea PR defectuoso; (f) merge aprobado activa Pages; (g) deploy conserva evidencia; (h) el cierre exige prueba real Safari o registra pendiente; (i) rollback está ensayado con un cambio inocuo.

## 17. Riesgos conocidos y decisiones pendientes de inicialización

| Ítem | Valor recomendado | Estado |
|---|---|---|
| Nombre/URL repo GitHub | `mapas-personalizables` u otro | PENDIENTE |
| Identidad del agente vs. dueño en GitHub | comprobar si son la misma | PENDIENTE |
| Hosting | GitHub Pages, entorno público de pruebas | PROPUESTO |
| Proveedor tiles | MapTiler inicialmente, sustituible | PROPUESTO |
| Política de aprobación | diseño + autorización de publicar pruebas en un único acto | PROPUESTO |
| Primer requisito | mapa real, GPS opt-in, selector Clásico/Off-road/RPG | PROPUESTO |
| Navegación giro a giro | no incluir en MVP | PROPUESTO |
| Offline | no incluir en MVP por licenciamiento/proveedor | PROPUESTO |

**Fuentes técnicas verificadas el 2026-11-15:**
- GitHub: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- GitHub Pages y privacidad: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Actions environments: https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments
- Vite + Pages: https://vite.dev/guide/static-deploy
- MapLibre: https://maplibre.org/maplibre-gl-js/docs/
- MapTiler API key: https://docs.maptiler.com/guides/developer/credentials/api-key/
- OpenStreetMap tiles: https://operations.osmfoundation.org/policies/tiles/