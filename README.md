# Mapp
App web de mapas personalizables, optimizada para Safari en iPhone.
Prototipo artístico v0.3 (experimental): vintage off-road con tres estilos (Vintage, Ilustrado y Topográfico), MapLibre GL JS, datos OpenStreetMap vía OpenFreeMap, ubicación GPS opcional y un marcador de vehículo tipo Jimny.
## Documentación
Leer AGENTS.md, METODOLOGIA.md, docs/CONTEXTO.md, docs/BITACORA.md y docs/REQUERIMIENTOS/MAP-0001.md.
## Publicación
GitHub Actions valida HTML y publica automáticamente desde main usando GitHub Pages (habilitar Settings > Pages > Build and deployment > GitHub Actions). El proyecto está diseñado para abrirse por HTTPS; un HTML abierto en el visor de archivos puede no cargar las teselas.

## Arte v0.3
Texturas procedurales Canvas repetidas sobre bosques de OpenStreetMap (`fill-pattern`), relieve DEM Mapterhorn con hillshade suave, paleta vintage. Las nuevas capas son opcionales y deben validarse con Safari real antes de aceptar la versión. No se usa una imagen fija de mapa.
