---
description: "Corre lint, verifica que el build de producción pasa y reporta problemas categorizados. Usar antes de commitear o hacer PR."
---

# /revisar — Codigo Camp

Ejecuta todas las verificaciones de calidad del proyecto y reporta resultados.

## Pasos

### Paso 1 — ESLint (frontend)

```bash
cd frontend && npm run lint
```

Resultado esperado: `0 errors, 0 warnings`

Si hay errores, listarlos categorizados:
- 🔴 **Errores** (bloquean el commit): deben corregirse
- 🟡 **Warnings**: analizar si deben corregirse

### Paso 2 — Build de producción

```bash
cd frontend && npm run build
```

Verificar:
- Sin errores de compilación
- El bundle se genera en `frontend/dist/`
- Sin warnings de tamaño de chunk excesivo (> 500kb)

### Paso 3 — Verificar la API manualmente

```bash
# Desde api/
node -e "require('./app')" &
sleep 2
curl -s http://localhost:8080/api/teams | head -c 200
kill %1 2>/dev/null
```

Si hay errores de sintaxis en JS, `node -e` los reportará inmediatamente.

### Paso 4 — Reporte final

```
═══════════════════════════════════════
  REPORTE DE CALIDAD — Codigo Camp
═══════════════════════════════════════
ESLint         : ✅ / ❌ (<N> errores, <N> warnings)
Build frontend : ✅ / ❌ (<error si hay>)
API sintaxis   : ✅ / ❌

Próximo paso:
  → Todo OK: listo para /commit
  → Hay errores: corregirlos antes de continuar
═══════════════════════════════════════
```

## Notas

- El lint usa `--max-warnings 0` — cualquier warning es un error
- Archivos ignorados por ESLint: `dist/`, `.eslintrc.cjs` (ver `frontend/.eslintrc.cjs`)
- Si `prop-types` aparece como error: está desactivado — verificar la configuración
