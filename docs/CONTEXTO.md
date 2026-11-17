# Contexto vigente — Mapp
Fecha: 2026-11-16.
Repositorio: rsuknocombanc/Mapp; rama estable main.
Producto: mapas reales personalizables, optimizado para Safari iPhone.
Tecnología prototipo: HTML + MapLibre GL JS + OpenStreetMap mediante OpenFreeMap; publicación GitHub Pages.
Diseño: off-road vintage inspirado en ilustraciones de mapas de aventura; referencias proporcionadas por el usuario. Diferentes versiones artísticas futuras: manchas verdes texturizadas para bosque, árboles dibujados y vista estrictamente superior.
Ubicación: marcador de vehículo modular tipo Suzuki Jimny naranja, visto desde arriba; GPS bajo permiso del usuario; ubicación inicial de demostración.
Estado: prototipo experimental v0.6.0 en rama feature/bootstrap-vintage-map, PR #1. Mapa plano de papel cálido y tinta artística; una sola estética compuesta por acuarela + bosque + tinta. Ocho árboles de acuarela aprobados, 3 tonos por árbol (atlas PNG georreferenciado de 24 sprites) sobre cobertura OSM wood/grass/parks, densidad corregida. Bosque #6B8652, agua petróleo #265D65 y caminos óxido #9B5737; sin DEM ni 3D. Vías por zoom. Búsqueda Photon, rutas OSRM demo y trazado libre; GPS opcional. Sintaxis y UI simulada validadas localmente, Safari real aún no validado. Inspiración general de mapas de aventura, no recursos propietarios de Firewatch.
Punto de continuidad: PR #1 con v0.6 MAP-0009, CI, Pages, UAT Edge/Safari. Árboles aprobados de acuarela y un único estilo; validar visual y fluidez con teselas reales. No fusionar main sin aprobación; una sola rama temporal.
