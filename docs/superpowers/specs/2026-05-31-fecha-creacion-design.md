# Spec: Fecha de Creación en Tareas

**Fecha:** 2026-05-31
**Estado:** Aprobado

## Objetivo

Mostrar la fecha de creación de cada tarea en el área `.meta` de la fila, en formato corto ("31 may", "1 jun"). No se necesita un campo nuevo: `id` ya es `Date.now()` en millisegundos.

## Modelo de datos

Sin cambios. La fecha se deriva de `t.id`:

```js
const created = new Date(t.id);
```

## Nueva función `fmtCreated(id)`

```js
function fmtCreated(id) {
  const d = new Date(id);
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
```

Ubicación: junto a `fmtDue()` en `popup.js`.

## Cambios en `rowHTML()`

### Condición del `.meta`

La condición actual solo muestra `.meta` si hay prioridad, due o URL:

```js
// Antes:
const meta = (!t.done && (t.priority !== 'none' || due || t.url)) ? ...
// Después:
const meta = !t.done ? ...
```

Justificación: como la fecha de creación siempre existe, `.meta` se muestra para todas las tareas pendientes.

### Contenido del `.meta`

Se añade `<span class="due">${fmtCreated(t.id)}</span>` al final del bloque `.meta`, después de `urlLink`:

```js
const meta = !t.done ? `<div class="meta">
  ${t.priority !== 'none' ? `<button class="prio" ...>...</button>` : ''}
  ${due ? `<span class="due ${due.overdue?'overdue':''}">${SVG.cal} ${due.label}</span>` : ''}
  ${t.url ? urlLink(t.url) : ''}
  <span class="due">${fmtCreated(t.id)}</span>
</div>` : '';
```

Reutiliza la clase `.due` (fuente mono, color `--muted`, `white-space:nowrap`). Sin icono para diferenciarlo visualmente de la fecha de vencimiento.

## CSS

Sin cambios. La clase `.due` ya tiene los estilos correctos.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `starter/popup.js` | Nueva función `fmtCreated(id)`, cambio en condición de `.meta` en `rowHTML()`, añadir `<span>` de fecha al `.meta` |

Sin cambios a `popup.html`, `tab.html`, ni `manifest.json`.

## Backward compatibility

Tareas existentes en storage tienen `id` = `Date.now()` desde siempre — todas mostrarán su fecha de creación correctamente sin migración.

## Lo que NO incluye este spec

- Formato relativo ("hace 2 días") — no pedido
- Mostrar fecha en tareas completadas — no pedido
- Ordenar por fecha de creación — no pedido
