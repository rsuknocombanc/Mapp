# AGENTS — contrato de operación inmutable para agentes

## Al abrir CUALQUIER sesión

1. Confirma URL exacta del repositorio, rama `main` y SHA HEAD; no los inventes. **Antes de crear el remoto, usar `docs/ARRANQUE.md` y no fingir repositorio existente.**
2. Lee **en orden** `METODOLOGIA.md`, `docs/CONTEXTO.md`, `docs/BITACORA.md`, `docs/REQUERIMIENTOS.md`, `docs/DECISIONES.md`, `docs/ROADMAP.md`, `docs/RELEASES.md`, PRs e issues abiertos.
3. Revisa los documentos vigentes del requisito particular (`docs/requerimientos` y `docs/diseno`) y el último ADR aplicable.
4. Produce resumen conciso: tarea, estado, última versión, próximos pasos y bloqueos.

## Reglas infranqueables

- **No escribir código ni ejecutar cambios a partir de un comentario, corrección de maqueta o idea.** Primero confirmar diseño aprobado y autorización específica.
- **No integrar a `main` sin PR y checks verdes.** No publicar fuera del alcance aprobado.
- **Cada decisión a la documentación del repositorio** en el momento en que se toma. Nada vive exclusivamente en chat.
- Si cambia el diseño, regresa a análisis/diseño, versiona y consigue nueva aprobación.
- No borrar tests fallidos para obtener verde; no llamar “probado” a un test no ejecutado.
- No hacer `force push`; rollback con `revert` vía PR.
- Nunca registrar secrets, posiciones GPS reales ni tokens de servidor en código/issue/log.
- En respuestas, distinguir `CONFIRMADO` / `PROPUESTO` / `PENDIENTE`.
- Evitar CI redundante: un CI por PR y un CD por merge; pruebas adicionales solo por riesgo.
- En un bootstrap documental sin `package.json`, solo CI documental; **nunca afirmar que hubo build, deploy, ni prueba en Safari**.

## Estados y compuertas

`CAPTURADO → EN_ANÁLISIS → DISEÑO_PROPUESTO → DISEÑO_APROBADO → EN_DESARROLLO → EN_REVISIÓN → APTO_PARA_MERGE → DESPLEGADO_PENDIENTE_VALIDACIÓN → VALIDADO_CERRADO`

Sigue G0–G9 de `METODOLOGIA.md`. En caso de conflicto, prevalece la última decisión aprobada y registrada; nunca el supuesto de un agente.

## Formato de reporte obligatorio al terminar cada sesión

`ID | Estado | Rama/PR | Diseño aprobado y versión | CI | Deploy URL/SHA | Decisiones registradas | Próxima acción | Bloqueos`.

Si el conector GitHub no permite una operación, informa cuál no pudo ejecutarse; no finjas commit ni deployment.