---
description: "Analiza los cambios en git, propone un mensaje de commit en formato Conventional Commits y ejecuta el commit. Usar cuando el usuario quiera commitear cambios."
---

# /commit — Codigo Camp

Genera y ejecuta un commit con mensaje convencional basado en los cambios actuales.

## Pasos

### Paso 1 — Verificar lint antes de commitear

```bash
cd frontend && npm run lint
```

Si hay errores de lint, **detener y reportar al usuario**. No commitear con lint rojo.

### Paso 2 — Analizar los cambios

```bash
git status
git diff --staged
git diff
```

### Paso 3 — Proponer mensaje de commit

Analizar qué archivos cambiaron y proponer mensaje con el formato:

```
<tipo>(<scope>): <descripción en imperativo, ≤50 chars>
```

| Tipo | Scope | Para qué |
|---|---|---|
| `feat` | `api` / `frontend` / `ui` / `db` | Nueva funcionalidad |
| `fix` | `api` / `frontend` / `ui` | Corrección de bug |
| `chore` | `config` / `agents` | Mantenimiento |
| `refac` | `api` / `frontend` | Refactorización |
| `docs` | `agents` | Documentación |

**Ejemplos para este proyecto:**
```
feat(api): agregar endpoint GET /api/teams/:id
fix(frontend): corregir URL hardcodeada en CashCounter
chore(config): migrar credenciales MySQL a .env
refac(ui): eliminar componentes legacy Button y ButtonIcon
docs(agents): agregar skill setup-testing
```

### Paso 4 — Pedir confirmación al usuario

Mostrar:
```
📝 Mensaje propuesto:
   feat(api): agregar endpoint de jugadores

Archivos a incluir:
   api/routes/jugadores.js
   api/controllers/jugadores.controller.js
   api/models/jugador.js
   api/models/server.js

¿Procedo con el commit? (o sugiere un mensaje alternativo)
```

### Paso 5 — Ejecutar el commit (con confirmación)

```bash
git add <archivos relevantes>
git commit -m "<mensaje confirmado>"
```

### Paso 6 — Confirmar resultado

```bash
git log --oneline -3
```

## Notas

- Nunca hacer `git add .` ciegamente — hacer staging selectivo
- Nunca incluir `.env`, `*.log`, `node_modules/` en el commit
- Si el usuario pide `--amend`, verificar que el commit NO está pusheado antes de proceder
- Formato de commit detallado: ver rule `git-workflow.mdc`
