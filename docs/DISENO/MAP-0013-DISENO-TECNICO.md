# MAP-0013 — Diseño técnico D0: vegetación orgánica + árboles cenitales
Versión D0 | 2026-11-17 | **D0 APROBADO, IMPLEMENTACIÓN AUTORIZADA** (2026-11-17); preview/despliegue aún no autorizados.
Fuente de verdad: Issue #6, `docs/REQUERIMIENTOS/MAP-0013.md`, screenshot Edge/Safari, Mapp v0.8.0.
Alcance de esta sesión: diseño y dos comparaciones visuales **conceptuales**, no commit de código.

## 1. Diagnóstico documentado (código actual)
- `assets/app.js:artStyle()` colorea rellenos de base por clases y `addArtWashes()` añade 13 veladuras del proveedor OpenMapTiles (`landcover`, `park`, `water`). Vegetación: `mapp-forest-wash`, `mapp-forest-lift`, `mapp-grass-wash`, `mapp-park-wash`, tres halos de `line-blur` muy amplios y dos trazos de borde de bosque. La captura muestra acumulación de fragmentos angulares y tonalidades oscuras en lugar de manchas orgánicas. **No está demostrado que una sola capa sea la causa**: puede intervenir solapamiento de polígonos, bordes vectoriales y sprites con opacidad parcial.
- `assets/forest.js` registra 24 sprites (8 variantes × 3 tonos) provenientes de `assets/trees/watercolor-atlas.png`, ancla `icon-anchor:bottom` e instala `mapp-tree-symbols` antes de `mapp-commune-boundary` o primera capa de vía. No existe una aserción que garantice que **todas** las capas de relleno/vegetación queden bajo árboles tras modificaciones del estilo. En captura Safari, algunos árboles parecen teñidos/ocultos por pintura. La opacidad `icon-opacity:.97` de MapLibre **no** corrige alfa bajo dentro del PNG original; hay que examinar ambos factores antes de declarar causa.
- `assets/layer-policy.js` filtra POI, piscinas y vías, añade frontera comunal desde z11. **No** modificar las reglas MAP-0012; integrar cualquier nueva capa con su orden, sin afectar ruta ni límites comunales.
- El estilo se carga dinámicamente desde `https://tiles.openfreemap.org/styles/liberty`, y `map.getStyle().layers` es el orden real de composición, de abajo hacia arriba. MapLibre proporciona `addLayer(layer,beforeId)` y `moveLayer(id,beforeId)`; los cambios de orden deben validarse con el Style Spec y el orden real en Edge/Safari.

## 2. Opciones estudiadas para la acuarela

| Alternativa | Ventaja | Riesgo | Propuesta |
| --- | --- | --- | --- |
| A. Veladuras vectoriales `fill/line-blur` sobre polígonos | Muy barata, ya existe | Produce bandas de borde, fragmentos poligonales e intensidad artificial | Rechazar como técnica principal para este objetivo |
| B. **Manchas/sellos translúcidos orgánicos georreferenciados** con diferentes máscaras alfa, tamaños y tonos | Aspecto irregular; uso directo de GeoJSON/MapLibre; sprites reutilizables; estable al pan | Repetición visible si faltan variantes; desborde de polígonos si no se limita; coste de overdraw GPU | **Piloto recomendado** con comparación visual real |
| C. Máscara Canvas por tesela con ruido/fractal multiescala, borde suavizado y composición alfa | Control de contornos y geografía | Reproyección por zoom, uniones de tesela, memoria y costo Safari más complejos | Fallback si B no cumple UAT |

### Propuesta B — composición multitonales sin triángulos
1. Bajo color uniforme muy suave (un solo relleno verde de baja opacidad, no acumulaciones de sombras); **desactivar en diseño** tres capas actuales de `line-blur` vegetal y `mapp-forest-edge` / `mapp-forest-pastel` o atenuarlas a cero si se verifica que causan la triangulación. No tocar agua ni caminos.
2. Construir un atlas compacto y transparente de **8–12 manchas irregulares no geométricas**, con bordes difusos y pigmento granular interno, sin contornos triangulares, sin estampas de patrón repetidas. Tres grupos tonales usando `#A2B078` verde claro, `#6B8652` verde medio, `#39593B` oscuro al **bajo alfa**. Variar tamaño, giro y opacidad.
3. Instanciar los sellos como puntos geográficos deterministas sobre polígonos reales (bosque, matorral/pasto y parques con densidades distintas), reutilizando clasificación de `forest.js`. Semilla por coordenadas Mercator y ruido espacial suave de dos escalas; evitar patrones de malla y que el refresco los haga saltar en desplazamientos pequeños.
4. Ubicar centros dentro de polígonos válidos y usar **falloff** de tamaño/intensidad cerca del borde para evitar desborde excesivo; pequeñas fugas difusas al papel son admisibles como estética de acuarela, pero no deben invadir ríos/carreteras de manera legible. Los caminos se renderizan por encima.
5. Presupuesto de prueba, no valor validado: hasta ~80 manchas simultáneas iPhone y ~160 escritorio, variable según zoom y tamaño; caché de sprite cargado una sola vez. Si hubiera problemas de FPS se reduce cantidad o se usa opción C bajo nueva evaluación.
6. El resultado debe parecer una **masa continua** de color claro con zonas oscuras y orillas suavemente irregulares, no discos reconocibles ni manchas repetidas tipo papel mural. Las zonas sin árboles también pueden tener aguadas tenues.

**Condición de decisión:** si la técnica B produce halos circulares, recortes por teselas, repetición, popping por zoom o no permite continuidad de masas, detener su adopción y comparar con opción C antes de ampliar alcance. No confundir este diseño con garantía de fidelidad a imagen conceptual.

## 3. Nuevo atlas de copas exclusivamente cenitales

- Nuevo `assets/trees/canopy-atlas.png` optimizado con **dos familias**; ambas vistas exactamente desde arriba (proyección cenital, sin tronco largo visible en perspectiva lateral, suelo beige u horizonte):
  - `conifer-top`: radios de ramas y follaje oscuro en forma de roseta de conífera con variación angular/simetría natural.
  - `broadleaf-top`: copa compacta redondeada con bordes lobulados y varios verdes, centros de luz y sombras blandas.
- Cada familia con 8 variantes no idénticas × 3 tonos = **48 sprites** propuestos; tamaño de celda cuadrado, por ejemplo 128×128 px fuente con `pixelRatio:2` cuando convenga; alfa transparente fuera de la copa, parte central suficientemente opaca (> .85 como objetivo visual). Evitar borde cuadrado y sombra exterior beige.
- Registrar sprites como `mapp-canopy-<family>-<variant>-<tone>`; la expresión `icon-image` toma el sprite de cada feature. `icon-anchor:center` para ambas familias, `icon-rotation-alignment:map`, la variación de ángulo sigue determinista.
- Conservar algoritmo georreferenciado actual de densidad y escala por zoom (v0.7.0), salvo ajustes de radio visual para evitar saturación con coronas más anchas. No inventar ubicación botánica ni especies reales.
- **Selector de familia de árboles** bajo panel `ARTE`, sin crear otra selección de estilo general: dos botones/tarjetas con miniaturas originales, texto «Conífera cenital» y «Frondoso cenital», indicación del activo accesible para VoiceOver y áreas táctiles >=44 px. Predeterminado **Frondoso cenital** propuesto por preferencia visual del usuario; selección en estado de sesión, sin tracking ni persistencia obligatoria.
- Al seleccionar, actualizar las propiedades `sprite`/expresión de `icon-image` usando la GeoJSON ya existente o derivando nombre por familia (validador oficial obliga a verificar expresiones). No regenerar posiciones ni cambiar el mapa. Mantener nombre «pinos» en diagnóstico solo si sigue representando coníferas; proponer «árboles» si ambas familias son seleccionables.

## 4. Orden de dibujo obligatorio (corrección de la oclusión)

Orden lógico **de abajo hacia arriba**:
1. Papel y agua/base del terreno.
2. Colores suaves de `landcover`, `park` y aguadas orgánicas (`mapp-forest-wash-pigment` y/o GeoJSON stamps).
3. **`mapp-tree-symbols`**, sprites cenitales con alfa central fuerte.
4. Carreteras, senderos, ríos relevantes, frontera comunal visible, nombres y etiquetas.
5. Ruta `mapp-route-*`, waypoints y Jimny / controles DOM.

**Diseño de mecanismo:** centralizar la decisión de anclaje para añadir o reordenar capas forestales con `map.addLayer(..., beforeId)` y `map.moveLayer(..., beforeId)`; antes de insertar árboles, verificar última capa verde real del estilo, primera vía y primer símbolo de etiqueta, y garantizar que todas las verdes queden antes del árbol. Si el proveedor presenta una secuencia incompatible, registrar error explícito y fijar el orden sin borrar datos; no confiar en la primera carretera oculta o frontera comunal como ancla universal. Mantener ruta top layer tras `style.load`. **Prueba de contrato:** `max(index(vegetation)) < index(tree) < min(index(navigation/labels)) < index(route)`, permitiendo líneas de agua/municipio cuya prioridad respecto a árbol se defina por legibilidad. Para evitar ambigüedad entre símbolos y viarios, los caminos deben seguir visibles sobre copas.

**Diagnóstico adicional:** inspeccionar transparencia interna del atlas actual: `icon-opacity` casi 1 no vuelve opaco un PNG con zonas semitransparentes. Nuevas copas deben tener centro de alfa alto y periferia suave; sombra de copa tenue opcional, nunca base beige.

## 5. Diseño de pantalla y comportamiento
- Mantener cabezal, búsqueda, brújula y panel `ARTE / TRAZAR RUTA` del prototipo.
- En panel `ARTE`, agregar solo sección compacta «ÁRBOLES», dos opciones cenitales con foco/estado y miniaturas; no abrir menú independiente sobre el mapa, no ocultar mandos de ruta.
- Estado activo cambia de inmediato sin mover la cámara; toda la zona conserva misma geografía. Sin mezcla automática de ambas especies en versión piloto.
- Cambiar selección a zoom z9/z12/z15 no altera recuento ni distribución real, solo iconografía; detectar clipping y colisión.
- Vista general con coronas menores y bosque continuo; vista cercana con copas más detalladas, sin aspecto de loseta o botón puesto sobre el mapa.

## 6. Validaciones obligatorias
- Automatizadas: nueva atlas PNG realmente transparente y cuadrado por celda; 48 sprites cargados, cero de perspectiva; al alternar opción solo cambia `sprite`, no `Point.geometry`; determinismo y jerarquía por zoom; correctas fuentes/colores; orden exacto de capas incluso si el proveedor cambia su orden; verificación oficial MapLibre de `icon-image`/`icon-size`; no regresión de MAP-0012.
- Reales: Safari iPhone (vista z11, z14.5 y z16), Edge (misma zona), color, transparencia y FPS antes/después. Medir latencia de cambio de familia y memoria; una maqueta generada no valida GPU ni fuente real.
- Criterios visuales: cero triángulos/grandes caras de sombra; manchas con borde irregular suave y al menos 3 grados de pigmento, sin discos/repeticiones evidentes; copas siempre visibles por encima del relleno; carreteras/etiquetas/rutas por encima.
- Riesgos: variación tonal sobre polígonos heterogéneos, exceso de símbolos, superposición al agua, cortes en bordes de tile, Safari WebGL alpha blending; diseñar fallback a acuarela simple sin perder rutas ni bosque.

## 7. Aprobaciones y continuidad
**Solo se ha autorizado estudiar y mostrar el diseño.** El presente D0 requiere aceptación explícita, idealmente confirmando las dos familias, la técnica B y `Frondoso cenital` como predeterminado. La implementación, CI funcional y publicación de preview requieren autorización independiente posterior. No fusionar `main` sin UAT y consentimiento adicional. Se preserva ADR-0011 como historial y se crea borrador ADR-0013 no adoptado.

## 8. Compuertas de aprobación formal
Confirmación única de diseño D0 recibida dos veces: «Apruebo el diseño técnico D0 de MAP-0013: manchas orgánicas multitonales, árboles por encima de la vegetación, selector con Conífera cenital y Frondoso cenital, este último predeterminado. Registra la aprobación. Todavía no autorizo implementar; solicita esa autorización por separado.»
Autorización posterior independiente: «Autorizo el desarrollo e implementación».
Se habilitan desarrollo, integración de recursos al prototipo en rama y validación CI. **NO queda habilitado publicar `gh-pages` ni fusionar `main`; solicitar ambos permisos antes de actuar.**
