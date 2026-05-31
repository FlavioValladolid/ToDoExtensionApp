# Starter — extensión funcional (esqueleto)

Punto de partida en **vanilla JS** (sin dependencias ni build) que ya implementa el diseño.
Cárgalo en Chrome y funciona; úsalo como base o tradúcelo a tu stack (React/Vue).

## Probar en Chrome
1. Genera 4 PNG en `icons/` (16, 32, 48, 128 px) — ver `icons/README.txt`.
2. Ve a `chrome://extensions`, activa **Modo de desarrollador**.
3. **Cargar descomprimida** → selecciona esta carpeta `starter/`.
4. Fija la extensión y haz clic en su ícono.

## Qué incluye
- `manifest.json` — Manifest V3 (popup + permisos `storage`, `activeTab`, `tabs`).
- `popup.html` — markup + estilos con los design tokens (claro/oscuro vía `data-theme`).
- `popup.js` — estado, render, persistencia y captura de pantalla.

## Funciona
Agregar (Enter / +), completar, borrar (hover), filtrar por categoría, ciclar prioridad,
fecha relativa, **tarea con captura** (`chrome.tabs.captureVisibleTab`, con fallback a canvas
fuera de Chrome), miniatura + lightbox, tema claro/oscuro, persistencia (`chrome.storage.local`
en la extensión, `localStorage` standalone).

## Simplificado respecto al prototipo (pendiente de portar)
- La **fila de opciones del input** (elegir prioridad / categoría / fecha al crear una tarea
  normal) no tiene UI aquí: existen las variables `draftPrio` / `draftCat` / `draftDue` pero
  faltan los chips que se despliegan al enfocar el input. Ver la sección “Área de agregar” del
  README principal.
- Los **tweaks** (densidad, radio, fuente, acento) son del prototipo, no de la extensión.
- Fuente: usa el stack del sistema. Para usar **Geist**, empaqueta los `.woff2` localmente y
  decláralos con `@font-face` (la CSP de MV3 bloquea fuentes remotas).

Consulta el `README.md` de la carpeta superior para la especificación completa al pixel.
