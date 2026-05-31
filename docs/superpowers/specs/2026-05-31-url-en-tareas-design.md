# Spec: Guardar URL en Tareas

**Fecha:** 2026-05-31
**Estado:** Aprobado

## Objetivo

Añadir un botón `🔗` en el add-bar del popup/tab que captura la URL de la pestaña activa y la adjunta a la próxima tarea creada. La URL se muestra en la tarea como un enlace clickeable con favicon y dominio.

## Modelo de datos

Campo `url` añadido opcionalmente al objeto de tarea:

```js
{
  id: number,
  text: string,
  done: boolean,
  priority: 'none' | 'alta' | 'media' | 'baja',
  cat: string,
  due: string | null,
  shot: string | undefined,   // existente
  url: string | undefined,    // nuevo
}
```

Backward compatible: tareas existentes sin `url` funcionan igual.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `starter/popup.js` | Estado `draftUrl`, función `captureUrl()`, función `syncUrlBtn()`, handler en `init()`, campo `url` en `addDraft()`, render del link en `rowHTML()` |
| `starter/popup.html` | Añadir botón `#url-btn` en el add-bar |
| `starter/tab.html` | Añadir botón `#url-btn` en el add-bar (misma posición) |

Sin cambios a `manifest.json` — el permiso `tabs` ya existe.

## Flujo de datos

```
clic en #url-btn (inactivo)
  → chrome.tabs.query({ active: true, currentWindow: true })
  → draftUrl = tab.url
  → syncUrlBtn() → botón se resalta (--accent)

clic en #url-btn (activo)
  → draftUrl = null
  → syncUrlBtn() → botón vuelve a estado neutro

addDraft()
  → tasks = [{ ..., url: draftUrl || undefined }, ...tasks]
  → draftUrl = null
  → syncUrlBtn()
```

## Captura de URL

```js
async function captureUrl() {
  if (!window.chrome?.tabs) return null;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url || null;
}
```

Requiere permiso `tabs` (ya declarado). En modo standalone (sin Chrome APIs) el botón es no-op silencioso.

## Estado del botón

Nuevo estado: `let draftUrl = null;`

- **Inactivo:** mismo estilo que `.cam` (borde + `--muted`)
- **Activo:** clase `.on` aplicada → fondo `--accent`, ícono blanco (mismo patrón que `.add-btn.on`)

```js
function syncUrlBtn() {
  const btn = $('url-btn');
  if (btn) btn.classList.toggle('on', !!draftUrl);
}
```

El botón usa la clase `.cam` para el estilo base y añade/quita `.on` para el estado activo.

## SVG del ícono

```js
link: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
```

## Display en la tarea

En `rowHTML()`, dentro de `.meta`, junto a prioridad y fecha:

```js
function urlLink(url) {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    return `<a class="url-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
      <img src="${favicon}" width="12" height="12" alt="" onerror="this.style.display='none'">
      ${escapeHtml(domain)}
    </a>`;
  } catch { return ''; }
}
```

- `onerror="this.style.display='none'"` oculta el favicon silenciosamente si falla
- `rel="noopener noreferrer"` por seguridad en `target="_blank"`
- `escapeHtml()` ya existe en popup.js — se usa para evitar XSS
- Si `new URL(url)` lanza (URL malformada), el bloque `catch` devuelve `''` sin romper el render

## Condición de `.meta` en `rowHTML()`

La condición actual solo muestra `.meta` si hay prioridad o fecha. Debe incluir URL:

```js
// Antes:
const meta = (!t.done && (t.priority !== 'none' || due)) ? ...
// Después:
const meta = (!t.done && (t.priority !== 'none' || due || t.url)) ? ...
```

## CSS nuevo

```css
.url-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--muted);
  text-decoration: none;
  white-space: nowrap;
}
.url-link:hover { color: var(--text); }
.url-link img { border-radius: 2px; flex-shrink: 0; }
```

Añadido en `popup.html` y `tab.html`.

## HTML del botón

En el add-bar de `popup.html` y `tab.html`, después del botón `#cam`:

```html
<button class="cam" id="url-btn" title="Guardar URL de esta página"></button>
```

Usa la clase `.cam` (ya tiene los estilos correctos: 30×30px, borde, color muted). La clase `.on` ya está definida en `.add-btn.on` pero se reutiliza — ambas clases comparten el mismo selector de fondo/color activo. Se añade `.on` a `.cam` en el CSS.

## Actualización de CSS para `.cam.on`

```css
.cam.on, .add-btn.on { background: var(--accent); color: var(--on-accent); }
```

Actualmente solo `.add-btn.on` está definido. Se extiende para cubrir `.cam.on` también.

## Lo que NO incluye este spec

- Edición de la URL guardada (no pedido)
- Mostrar la URL completa (solo dominio + favicon)
- Captura automática sin interacción del usuario
- Soporte en `viewer.html` (no aplica)
