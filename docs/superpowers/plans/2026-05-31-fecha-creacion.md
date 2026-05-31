# Fecha de Creación en Tareas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar la fecha de creación de cada tarea pendiente en el área `.meta` como "31 may", "1 jun".

**Architecture:** `id` ya es `Date.now()` — se añade `fmtCreated(id)` que reutiliza el array `MON` existente. `rowHTML()` simplifica su condición de `.meta` a `!t.done` y añade el span de fecha al final del bloque.

**Tech Stack:** JavaScript vanilla, HTML/CSS (sin dependencias nuevas).

---

### Task 1: `fmtCreated()` y `rowHTML()` en popup.js

**Files:**
- Modify: `starter/popup.js:44` (añadir función después de `fmtDue`)
- Modify: `starter/popup.js:189-193` (cambiar condición y contenido de `.meta` en `rowHTML`)

- [ ] **Step 1: Añadir `fmtCreated()` después de `fmtDue()`**

Localiza la línea 44 en `starter/popup.js` — la línea en blanco después del cierre de `fmtDue()`:

```js
  return { label, overdue: diff < 0, soon: diff === 0 || diff === 1 };
}
                          ← línea 44 (en blanco)
function isoToDate(iso) {
```

Inserta la nueva función en esa línea en blanco:

```js
function fmtCreated(id) {
  const d = new Date(id);
  return `${d.getDate()} ${MON[d.getMonth()]}`;
}
```

Resultado esperado en esa zona:
```js
  return { label, overdue: diff < 0, soon: diff === 0 || diff === 1 };
}
function fmtCreated(id) {
  const d = new Date(id);
  return `${d.getDate()} ${MON[d.getMonth()]}`;
}
function isoToDate(iso) {
```

- [ ] **Step 2: Actualizar el bloque `.meta` en `rowHTML()`**

Localiza las líneas 189-193 en `starter/popup.js`:

```js
  const meta = (!t.done && (t.priority !== 'none' || due || t.url)) ? `<div class="meta">
    ${t.priority !== 'none' ? `<button class="prio" data-prio="${t.id}"><span class="dot" style="background:${p.dot}"></span>${p.label}</button>` : ''}
    ${due ? `<span class="due ${due.overdue?'overdue':''}">${SVG.cal} ${due.label}</span>` : ''}
    ${t.url ? urlLink(t.url) : ''}
  </div>` : '';
```

Reemplaza por:

```js
  const meta = !t.done ? `<div class="meta">
    ${t.priority !== 'none' ? `<button class="prio" data-prio="${t.id}"><span class="dot" style="background:${p.dot}"></span>${p.label}</button>` : ''}
    ${due ? `<span class="due ${due.overdue?'overdue':''}">${SVG.cal} ${due.label}</span>` : ''}
    ${t.url ? urlLink(t.url) : ''}
    <span class="due">${fmtCreated(t.id)}</span>
  </div>` : '';
```

Cambios exactos:
1. `(!t.done && (t.priority !== 'none' || due || t.url))` → `!t.done`
2. Añadir `    <span class="due">${fmtCreated(t.id)}</span>` antes del `  </div>`

- [ ] **Step 3: Verificar manualmente**

Carga la extensión en Chrome (`chrome://extensions` → Recargar). Abre el popup. Toda tarea pendiente debe mostrar en la sección `.meta` (la fila gris con prioridad, fecha, URL) un texto al final como "31 may" o "1 jun" en fuente monoespaciada gris.

Comprobaciones:
- Tarea sin prioridad, sin due, sin URL → `.meta` aparece solo con la fecha de creación
- Tarea con prioridad → muestra prioridad + fecha creación
- Tarea completada → no muestra `.meta` (sin cambio respecto al comportamiento anterior)
- La fecha corresponde al día en que se creó la tarea

- [ ] **Step 4: Commit**

```bash
git add starter/popup.js
git commit -m "feat: show creation date in task meta"
```
