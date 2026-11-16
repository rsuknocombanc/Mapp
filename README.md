# Mapp
App web de mapas personalizables, optimizada para Safari en iPhone.
Prototipo artístico v0.3 (experimental): vintage off-road con tres estilos (Vintage, Ilustrado y Topográfico), MapLibre GL JS, datos OpenStreetMap vía OpenFreeMap, ubicación GPS opcional y un marcador de vehículo tipo Jimny.
## Documentación
Leer AGENTS.md, METODOLOGIA.md, docs/CONTEXTO.md, docs/BITACORA.md y docs/REQUERIMIENTOS/MAP-0001.md.
## Publicación
GitHub Actions valida HTML y publica automáticamente desde main usando GitHub Pages (habilitar Settings > Pages > Build and deployment > GitHub Actions). El proyecto está diseñado para abrirse por HTTPS; un HTML abierto en el visor de archivos puede no cargar las teselas.

## Arte v0.3
Texturas procedurales Canvas repetidas sobre bosques de OpenStreetMap (`fill-pattern`), relieve DEM Mapterhorn con hillshade suave, paleta vintage. Las nuevas capas son opcionales y deben validarse con Safari real antes de aceptar la versión. No se usa una imagen fija de mapa.

## Actualización experimental v0.3.1
Coloración por altitud DEM mediante MapLibre color-relief; bandas de cota iniciales y hillshade 2D suave. La vegetación ya no usa patrones repetitivos. Edificios 3D ocultos. Barra de búsqueda geográfica Photon (instancia pública solo para pruebas de bajo tráfico, sin SLA), selección de resultados y marcador independiente del Jimny. GPS opcional únicamente con permiso. Requiere conexión HTTPS para funcionar plenamente. UAT Safari pendiente.
