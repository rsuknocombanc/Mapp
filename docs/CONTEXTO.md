# Contexto vigente — Mapp
Fecha: 2026-11-16.
Repositorio: rsuknocombanc/Mapp; rama estable main.
Producto: mapas reales personalizables, optimizado para Safari iPhone.
Tecnología prototipo: HTML + MapLibre GL JS + OpenStreetMap mediante OpenFreeMap; publicación GitHub Pages.
Diseño: off-road vintage inspirado en ilustraciones de mapas de aventura; referencias proporcionadas por el usuario. Diferentes versiones artísticas futuras: manchas verdes texturizadas para bosque, árboles dibujados y vista estrictamente superior.
Ubicación: marcador de vehículo modular tipo Suzuki Jimny naranja, visto desde arriba; GPS bajo permiso del usuario; ubicación inicial de demostración.
Estado: prototipo experimental v0.3.1 en rama feature/bootstrap-vintage-map, PR #1. Implementación artística mediante MapLibre color-relief sobre DEM Mapterhorn (cotas por elevación), hillshade tenue, sin patrones de bosque ni extrusiones 3D. Buscador de lugares Photon público con límites de consultas. Sintaxis y UI simulada validadas localmente, Safari real aún no validado. Inspiración general de mapas de aventura, no recursos propietarios de Firewatch.
Punto de continuidad: comprobar rama/HEAD/PR #1, CI, Pages, UAT Safari, validar DEM/color-relief y buscador Photon en servidor real; retocar paleta por feedback. Mantener main estable y una sola rama temporal.
