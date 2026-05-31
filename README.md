# Handoff: Extensión de Chrome — Lista de Tareas (To Do)

## Prompt para Claude Code

> Implementa una **extensión de Google Chrome** de lista de tareas (To Do) siguiendo
> fielmente el diseño de referencia incluido en esta carpeta (`To Do List.html` + `app.jsx`).
> El diseño es **alta fidelidad**: respeta colores, tipografía, espaciado e interacciones
> al pixel. Construye una extensión real (Manifest V3) con un **popup** que se abre al hacer
> clic en el ícono de la barra. Usa el stack que prefieras (vanilla JS o React + Vite);
> el prototipo está en React pero no es obligatorio. Persiste los datos con
> `chrome.storage.local` (no `localStorage`). No copies el HTML tal cual: recréalo como
> una extensión funcional siguiendo las especificaciones de abajo.

---

## Overview
Popup minimalista de lista de tareas para una extensión de Chrome. El usuario gestiona
tareas rápidas: agregar, completar, borrar, filtrar por categoría, asignar prioridad y
fecha de vencimiento. Modo claro/oscuro con interruptor.

## Sobre los archivos de diseño
Los archivos de esta carpeta son **referencias de diseño creadas en HTML** — un prototipo
que muestra el aspecto y comportamiento deseados, **no código de producción para copiar
directamente**. La tarea es **recrear este diseño como una extensión de Chrome real**
(Manifest V3) usando las APIs y patrones apropiados. El prototipo usa un marco de ventana
de Chrome falso solo para dar contexto visual — **eso no forma parte de la extensión**; lo
que debes construir es únicamente el **popup** (el panel de 380px).

## Fidelidad
**Alta fidelidad (hifi).** Colores, tipografía, espaciado e interacciones son finales.
Recréalos con precisión.

---

## La pantalla: Popup

- **Tamaño:** 380px de ancho × 540px de alto (tamaño típico de popup de Chrome).
- **Estructura vertical (flex column):**
  1. **Header** (cabecera fija)
  2. **Tabs de categorías** (fila horizontal scrolleable)
  3. **Lista de tareas** (área scrolleable, `flex: 1`)
  4. **Área de agregar** (fija abajo)

### 1. Header
- Padding `15px 16px 12px`, borde inferior `1px solid var(--border)`.
- Izquierda: título **“Tareas”** (17px, weight 600, letter-spacing -0.01em) y debajo un
  contador en fuente mono (11px, color muted): `"4 pendientes"` / `"todo listo"` cuando no
  hay pendientes. `white-space: nowrap`.
- Derecha: botón de ícono 32×32 (borde 1px, radius del tema) que alterna **modo claro/oscuro**
  (ícono luna en claro, sol en oscuro).

### 2. Tabs de categorías
- Fila flex, `gap: 6px`, padding `11px 16px`, borde inferior, `overflow-x: auto`.
- Chips: `Todas`, `Trabajo`, `Personal`, `Compras`.
- Cada chip: padding `5px 11px`, `border-radius: 999px`, fuente 12.5px weight 500, con un
  contador mono (10.5px) al lado mostrando tareas **pendientes** de esa categoría.
- Chip activo: fondo = color de acento, texto blanco, sin borde. Inactivo: transparente,
  borde 1px, texto muted. Transición `all .14s`.

### 3. Lista de tareas
- Padding `6px 8px 10px`, scroll vertical.
- **Orden de pendientes:** por prioridad (alta → media → baja → ninguna), luego por fecha.
- **Fila de tarea** (`Row`): flex, `align-items: flex-start`, gap según densidad, padding
  `var(--row) 8px`, `border-radius` del tema. Fondo `var(--hover)` al hacer hover.
  - **Checkbox:** botón 20×20, `border-radius: min(radius,10)`, borde 1.6px. Sin marcar:
    borde `var(--borderStrong)`, fondo transparente. Marcado: fondo = acento, check blanco
    (SVG, stroke-width 3.2).
  - **Texto:** tamaño según densidad (~14.5px), line-height 1.35. Si está completada:
    color `var(--faint)` + `line-through`.
  - **Meta** (solo si no está completada y tiene prioridad o fecha): fila con gap 10px,
    margin-top 5px:
    - Prioridad: punto de color 7×7 redondo + etiqueta (11px, muted). Click en ella **cicla**
      la prioridad (ninguna → alta → media → baja).
    - Fecha: ícono calendario + etiqueta mono (10.5px). `white-space: nowrap`. Color:
      vencida = rojo `oklch(0.63 0.18 25)`; hoy/mañana = texto normal; resto = muted.
  - **Borrar:** botón × a la derecha (24×24), `opacity: 0` por defecto, `opacity: 1` en
    hover de la fila.
- **Sección “Completadas”:** separador con etiqueta mono en mayúsculas (10.5px, letter-spacing
  0.08em, color faint), una línea divisoria flexible y el conteo. Debajo, las tareas
  completadas atenuadas.
- **Estado vacío:** círculo 44×44 con borde + check, texto “Nada por aquí” y
  “Agrega tu primera tarea abajo”.

### 4. Área de agregar
- Borde superior, fondo `var(--bg)`, padding `10px 12px`.
- **Input row:** contenedor flex con fondo surface, borde 1px (acento cuando está enfocado),
  radius del tema, padding `8px`.
  - **Botón de cámara** (izquierda, 30×30, borde 1px): crea una **tarea con captura de pantalla**.
  - Input de texto placeholder “Agregar tarea…”, sin borde, 14px.
  - Botón **+** 30×30: deshabilitado (gris) si el input está vacío; con acento + ícono blanco
    si hay texto. **Enter** también agrega.
- **Opciones** (aparecen con animación `max-height`/`opacity .2s` al enfocar el input o
  escribir): fila de botones pequeños (padding `5px 9px`, radius del tema, 11.5px weight 500):
  1. **Prioridad:** punto + etiqueta; click cicla la prioridad de la nueva tarea.
  2. **Categoría:** etiqueta; click cicla entre Trabajo/Personal/Compras. Por defecto sigue
     a la categoría del tab activo.
  3. **Fecha:** ícono calendario + “Fecha”; abre un `<input type="date">` oculto
     (`showPicker()`). Cuando hay fecha, muestra la etiqueta formateada y un botón × para
     limpiarla.

---

## Función: Tarea con captura de pantalla
Flujo: el usuario pulsa el **botón de cámara** → se captura la **pantalla/pestaña actual** →
aparece una **tarjeta de composición** al inicio de la lista con la miniatura de la captura
y un campo **“Nombre de la actividad…”** (autofocus). El usuario nombra la actividad y pulsa
**Guardar tarea** (Enter) o **Cancelar** (Escape). La tarea resultante guarda la imagen y
muestra una **miniatura** (104×64, redondeada) bajo el título; al tocarla se abre un
**lightbox** (fondo oscurecido, click para cerrar) con la captura ampliada.

- **En la extensión real:** captura con `chrome.tabs.captureVisibleTab(null, { format: 'png' })`
  (requiere el permiso `activeTab` o `<all_urls>` + `tabs`). Guarda el data URL en el campo
  `shot` de la tarea. *En el prototipo se simula dibujando una representación de la página en
  un `<canvas>` porque no hay acceso a la pestaña real.*
- La tarjeta de composición: borde de acento, miniatura full-width (~116px alto), input y
  botones Guardar (acento) / Cancelar.
- El nombre por defecto si se deja vacío: “Captura de pantalla”.

## Interacciones y comportamiento
- **Agregar:** Enter o botón +. La tarea nueva entra al inicio con la prioridad/categoría/fecha
  elegidas. Se resetean prioridad y fecha tras agregar (la categoría se mantiene).
- **Completar:** click en checkbox → toggle `done`. Las completadas bajan a la sección
  “Completadas” y se atenúan.
- **Borrar:** botón × (visible en hover) elimina la tarea.
- **Ciclar prioridad** desde la fila: click en la etiqueta de prioridad.
- **Filtrar:** tabs de categoría filtran la lista; el contador del header refleja los
  pendientes del filtro activo.
- **Tema:** el botón del header alterna claro/oscuro.
- **Animaciones:** transiciones suaves (.12–.2s ease) en hover, foco, aparición de opciones.

## State / datos
Modelo de tarea:
```js
{ id, text, done: boolean, priority: 'none'|'alta'|'media'|'baja',
  cat: 'trabajo'|'personal'|'compras', due: 'YYYY-MM-DD'|null,
  shot?: string /* data URL PNG de la captura, opcional */ }
```
Estado de UI: `filter` (categoría activa), borradores del formulario (`draft`, `dPrio`,
`dCat`, `dDue`), `focused`.

**Persistencia:** en la extensión real usa **`chrome.storage.local`** (read al montar,
write en cada cambio). El prototipo usa `localStorage` con la clave `todo_popup_tasks_v2`.

## Fechas
Formato en español relativo: `Hoy`, `Mañana`, `Ayer`, o `"<día> <n> <mes>"` (ej. “mar 2 jun”),
con días `dom…sáb` y meses `ene…dic`. Marca como vencida si la fecha es anterior a hoy.

---

## Design tokens

### Color — modo claro
| token | valor |
|---|---|
| bg | `#fafaf9` |
| surface | `#ffffff` |
| sunk | `#f4f4f2` |
| text | `#1c1c1a` |
| muted | `#8a8a85` |
| faint | `#b9b9b3` |
| border | `#ececea` |
| borderStrong | `#dededb` |
| hover | `#f4f4f2` |
| overlay | `rgba(28,28,26,0.06)` |

### Color — modo oscuro
| token | valor |
|---|---|
| bg | `#161614` |
| surface | `#1e1e1c` |
| sunk | `#1a1a18` |
| text | `#f2f2ef` |
| muted | `#8f8f8a` |
| faint | `#5c5c58` |
| border | `#2a2a27` |
| borderStrong | `#33332f` |
| hover | `#242421` |
| overlay | `rgba(255,255,255,0.06)` |

### Acento (por defecto grafito; opciones)
- `#1c1c1a` (grafito, default) · `oklch(0.55 0.16 255)` (azul) ·
  `oklch(0.55 0.13 160)` (verde) · `oklch(0.55 0.18 25)` (rojo). Texto sobre acento: `#ffffff`.

### Prioridad (puntos)
- alta `oklch(0.63 0.18 25)` · media `oklch(0.74 0.15 75)` · baja `oklch(0.62 0.12 250)` ·
  ninguna: sin punto.

### Tipografía
- Sans: **Geist** (Google Fonts), fallback `system-ui, 'Helvetica Neue', sans-serif`.
- Mono: **Geist Mono** para contadores, fechas y etiquetas de sección.
- Escala: título 17/600 · texto de tarea ~14.5 · meta 11 · mono 10.5–11.

### Forma / densidad (configurable, defaults)
- Radius: recto 4 · **suave 9** (default) · redondo 16.
- Densidad (padding de fila / gap / font): compacto `7/9/13.5` · **normal `10/11/14.5`**
  (default) · cómodo `14/13/15.5`.

## Assets / íconos
Todos los íconos son **SVG inline** (check, +, ×, calendario, sol, luna) — stroke, sin
relleno. No se usan imágenes externas. Fuentes desde Google Fonts (Geist / Geist Mono).
Para la extensión, genera además los íconos de la extensión (16/32/48/128px) — un check
sobre el color de acento funciona bien.

## Manifest V3 (sugerido)
```json
{
  "manifest_version": 3,
  "name": "Tareas",
  "version": "1.0.0",
  "action": { "default_popup": "popup.html", "default_title": "Tareas" },
  "permissions": ["storage", "activeTab", "tabs"],
  "icons": { "16": "icons/16.png", "32": "icons/32.png", "48": "icons/48.png", "128": "icons/128.png" }
}
```
> `activeTab` + `tabs` son necesarios para `chrome.tabs.captureVisibleTab` (tarea con captura).

## Archivos en este bundle
- `To Do List.html` — prototipo (incluye el marco de Chrome falso, solo para contexto).
- `app.jsx` — toda la lógica y estilos del popup (la referencia principal a recrear).
- `tweaks-panel.jsx` / `frames/browser-window.jsx` — andamiaje del prototipo;
  **no forman parte de la extensión**, ignóralos en la implementación.
- `screenshots/` — capturas de referencia del popup en modo **claro** y **oscuro**.
- `starter/` — **esqueleto funcional** en vanilla JS (Manifest V3) listo para cargar en
  Chrome y usar como base: `manifest.json`, `popup.html`, `popup.js`. Ver `starter/README.md`.
