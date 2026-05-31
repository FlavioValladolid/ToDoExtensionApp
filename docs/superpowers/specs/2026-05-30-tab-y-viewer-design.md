# Spec: Tab completo y viewer de capturas

**Fecha:** 2026-05-30
**Estado:** Aprobado

## Objetivo

Dos mejoras a la extensión Chrome "Tareas":

1. **Tab completo** — botón en el popup que abre la app a pantalla completa en una pestaña nueva.
2. **Viewer de capturas** — clic en una miniatura de captura abre la imagen a pantalla completa en una pestaña nueva (en lugar del lightbox interno, que apenas es visible en el espacio del popup).

## Arquitectura

### Archivos nuevos

| Archivo | Propósito |
|---|---|
| `starter/tab.html` | Versión tab de la UI: mismo HTML/CSS/JS que el popup, pero `body` a `width: 100%; height: 100vh` con contenido centrado en `max-width: 640px` |
| `starter/viewer.html` | Página mínima de visualización de capturas: fondo negro, imagen centrada, botón cerrar, soporte tecla Escape |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `starter/popup.html` | Añadir botón ⤢ (expand) en el header junto al toggle de tema |
| `starter/popup.js` | (1) Handler del botón expand → `chrome.tabs.create({ url: 'tab.html' })`; (2) Zoom de capturas → guarda imagen en `chrome.storage.local` bajo `todo_preview_img` → abre `viewer.html` en lugar del lightbox interno |

## Flujo de datos

### Tab completo
```
clic en ⤢ (popup)
  → chrome.tabs.create({ url: chrome.runtime.getURL('tab.html') })
  → tab.html carga popup.js
  → UI funciona igual que el popup, sin límite de tamaño
```

El botón ⤢ no aparece en `tab.html` (ya estás en el tab; ocultarlo evita abrir tabs recursivos).

### Viewer de capturas
```
clic en thumbnail (popup o tab)
  → chrome.storage.local.set({ todo_preview_img: dataUrl })
  → chrome.tabs.create({ url: chrome.runtime.getURL('viewer.html') })
  → viewer.html lee todo_preview_img
  → muestra imagen a pantalla completa
  → al cerrar/Escape: borra todo_preview_img del storage
```

## Diseño visual

### Popup — header
```
┌─────────────────────────────────┐
│ Tareas          [⤢]  [🌙]      │
│ 3 pendientes                    │
└─────────────────────────────────┘
```
El botón ⤢ usa el mismo estilo `.icon-btn` que el toggle de tema.

### Tab completo
- Fondo: `var(--bg)` del tema activo (claro u oscuro)
- Contenido: centrado horizontalmente con `max-width: 640px; margin: 0 auto`
- Header y add-bar: mismos componentes, sin botón ⤢

### Viewer
- Fondo: `#000`
- Imagen: `max-width: 100vw; max-height: 100vh; object-fit: contain`
- Botón cerrar: esquina superior derecha, cierra la pestaña con `window.close()`
- Tecla Escape: también cierra la pestaña

## Detección de modo (popup vs tab)

`popup.js` detecta si está corriendo en un tab comprobando si el documento es `tab.html`:

```js
const IS_TAB = location.pathname.includes('tab.html');
```

Se usa para:
- Ocultar el botón ⤢ cuando `IS_TAB === true`
- Ajustar clases de layout en el `<body>` si aplica

## Storage keys usadas

| Key | Tipo | Propósito |
|---|---|---|
| `todo_tasks` | array | Tareas (existente) |
| `todo_theme` | string | Tema claro/oscuro (existente, en `localStorage`) |
| `todo_preview_img` | string (dataUrl) | Imagen temporal para viewer; se borra al cerrar el viewer |

## Permisos requeridos

Sin cambios — `storage`, `activeTab`, `tabs` ya están en `manifest.json`.

## Lo que NO incluye este spec

- Rediseño del layout de tareas en el tab (misma UI que el popup).
- Override de la nueva pestaña de Chrome.
- Sincronización entre popup y tab en tiempo real (ambos leen/escriben en el mismo storage; Chrome sincroniza automáticamente entre contextos).
