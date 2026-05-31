# Spec: Captura + URL Combinada y Subtítulo de Página

**Fecha:** 2026-05-31
**Estado:** Aprobado

## Objetivo

Dos mejoras relacionadas al flujo de creación de tareas:

1. Permitir que una tarea tenga simultáneamente captura de pantalla (`shot`) y enlace URL (`url`). Actualmente `saveCompose()` descarta el `draftUrl` activo en lugar de incluirlo.
2. Capturar el título de la pestaña junto con la URL (al hacer clic en `🔗`) y mostrarlo como subtítulo en la fila de la tarea.

## Modelo de datos

Campo `pageTitle` añadido opcionalmente:

```js
{
  id: number,
  text: string,
  done: boolean,
  priority: 'none' | 'alta' | 'media' | 'baja',
  cat: string,
  due: string | null,
  shot: string | undefined,        // existente
  url: string | undefined,         // existente
  pageTitle: string | undefined,   // nuevo
}
```

Backward compatible: tareas existentes sin `pageTitle` funcionan igual.

## Estado

Nuevo estado: `let draftPageTitle = null;` junto a `draftUrl`.

Ambos se establecen y limpian juntos en todos los puntos de reset.

## Flujo de datos

```
clic en #url-btn (inactivo)
  → captureUrl() → { url, pageTitle }
  → draftUrl = url
  → draftPageTitle = pageTitle
  → syncUrlBtn()

clic en #url-btn (activo)
  → draftUrl = null
  → draftPageTitle = null
  → syncUrlBtn()

addDraft()
  → tasks = [{ ..., url: draftUrl || undefined, pageTitle: draftPageTitle || undefined }, ...tasks]
  → draftUrl = null; draftPageTitle = null; syncUrlBtn()

saveCompose()   ← cambio clave
  → tasks = [{ ..., shot: compose.shot, url: draftUrl || undefined, pageTitle: draftPageTitle || undefined }, ...tasks]
  → compose = null; draftUrl = null; draftPageTitle = null; syncUrlBtn()

compose cancel / Escape
  → compose = null; draftUrl = null; draftPageTitle = null; syncUrlBtn()
```

## Cambio en `captureUrl()`

```js
async function captureUrl() {
  if (!window.chrome?.tabs) return { url: null, pageTitle: null };
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return { url: tab?.url || null, pageTitle: tab?.title || null };
}
```

El caller destructura: `const { url, pageTitle } = await captureUrl();`

## Display del subtítulo en la tarea

En `rowHTML()`, dentro de `.body`, entre `.ttl` y `.meta`:

```js
${t.pageTitle ? `<div class="page-title">${escapeHtml(t.pageTitle)}</div>` : ''}
```

## CSS nuevo

```css
.page-title {
  font-size: 11.5px;
  color: var(--muted);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row.done .page-title { color: var(--faint); }
```

Añadido en `popup.html` y `tab.html`.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `starter/popup.js` | `captureUrl()` devuelve objeto, `draftPageTitle` state, url-btn handler actualizado, `saveCompose()` incluye url+pageTitle, todos los reset points incluyen `draftPageTitle = null`, `rowHTML()` renderiza `.page-title` |
| `starter/popup.html` | CSS `.page-title` añadido |
| `starter/tab.html` | CSS `.page-title` añadido |

Sin cambios a `manifest.json`.

## Lo que NO incluye este spec

- Mostrar URL en la compose card al tomar captura (no pedido)
- Edición del `pageTitle` guardado (no pedido)
- Captura automática de URL al hacer clic en `📷` (el usuario controla manualmente con ambos botones)
