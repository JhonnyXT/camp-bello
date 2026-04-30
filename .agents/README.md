# Skills — Codigo Camp

Índice de skills auto-invocadas disponibles en este proyecto.

## Skills instaladas

| Skill | Carpeta | Cuándo se activa |
|---|---|---|
| `add-api-endpoint` | `.agents/skills/add-api-endpoint/` | "crear endpoint", "nueva ruta", "nuevo recurso en la API" |
| `add-react-component` | `.agents/skills/add-react-component/` | "crear componente", "nueva pantalla", "nuevo elemento UI" |
| `add-sequelize-model` | `.agents/skills/add-sequelize-model/` | "nueva tabla", "nuevo modelo", "nueva entidad de BD" |
| `debug-fullstack` | `.agents/skills/debug-fullstack/` | "algo no funciona", "error en consola", "no carga" |
| `setup-env-vars` | `.agents/skills/setup-env-vars/` | ".env", "variables de entorno", "credenciales", "URL hardcodeada" |
| `setup-testing` | `.agents/skills/setup-testing/` | "configurar tests", "Vitest", "pruebas unitarias" |
| `systematic-debugging` | `.agents/skills/systematic-debugging/` | "bug", "test fallando", "comportamiento inesperado" |
| `vercel-react-best-practices` | `.agents/skills/vercel-react-best-practices/` | optimización React, performance, re-renders |
| `web-design-guidelines` | `.claude/skills/web-design-guidelines/` | "revisar UI", "accesibilidad", "auditar diseño" |

## Slash commands (invocar manualmente con `/`)

| Comando | Carpeta | Para qué |
|---|---|---|
| `/arrancar` | `.cursor/skills/arrancar/` | Instalar deps + lanzar dev servers + verificar URLs |
| `/revisar` | `.cursor/skills/revisar/` | Lint + build check + reporte de problemas |
| `/commit` | `.cursor/skills/commit/` | Analizar diff + proponer mensaje convencional + commitear |

## Subagents (en `.cursor/agents/`)

| Agente | Rol | Modo |
|---|---|---|
| `auditor-deuda` | Inventario priorizado de deuda técnica | read-only |
| `auditor-api` | Detectar endpoints sin validación, CORS abierto, credenciales | read-only |
| `revisor-ui` | Verificar dark mode, tokens de color, accesibilidad | read-only |

## Agregar nuevas skills

```bash
# Buscar skills públicas
npx skills find "<keyword>"

# Instalar una skill específica
npx skills add <owner/repo> --skill <nombre>

# Ver skills instaladas
npx skills list
```
