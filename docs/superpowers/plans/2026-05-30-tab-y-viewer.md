# Tab Completo y Viewer de Capturas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir un botón expand al popup que abre las tareas en una pestaña completa, y hacer que las miniaturas de capturas se abran a pantalla completa en una pestaña nueva.

**Architecture:** Se crean dos archivos HTML nuevos (`tab.html` y `viewer.html`) que comparten `popup.js` sin modificar su estructura. Los cambios en `popup.js` se limitan a: detección de modo (`IS_TAB`), handler del botón expand, y redirigir el zoom de capturas a `viewer.html` vía `chrome.storage.local`.

**Tech Stack:** Vanilla JS, Chrome Extension Manifest V3, `chrome.storage.local`, `chrome.tabs.create`, `chrome.runtime.getURL`

---

## File Map

| Acción | Archivo | Responsabilidad |
|---|---|---|
| Crear | `starter/viewer.html` | Página full-screen que muestra una captura leída desde storage |
| Crear | `starter/tab.html` | Versión tab del popup: mismos IDs/JS, body sin tamaño fijo, contenido centrado |
| Modificar | `starter/popup.html` | Añadir botón `#expand` en el header |
| Modificar | `starter/popup.js` | IS_TAB, SVG expand, handler expand, zoom hacia viewer.html |

---

## Task 1: Crear `viewer.html`

**Files:**
- Create: `starter/viewer.html`

- [ ] **Step 1: Crear el archivo**

Contenido completo de `starter/viewer.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Captura</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #000;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  img {
    max-width: 100vw;
    max-height: 100vh;
    object-fit: contain;
    display: block;
  }
  .close {
    position: fixed;
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,.15);
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 20px;
    display: grid;
    place-items: center;
    transition: background .14s;
  }
  .close:hover { background: rgba(255,255,255,.28); }
</style>
</head>
<body>
  <button class="close" id="close" title="Cerrar (Esc)">X</button>
  <img id="img" alt="captura de pantalla">
  <script>
    async function load() {
      const r = await chrome.storage.local.get('todo_preview_img');
      if (r.todo_preview_img) {
        document.getElementById('img').src = r.todo_preview_img;
        chrome.storage.local.remove('todo_preview_img');
      }
    }
    load();
    document.getElementById('close').onclick = () => window.close();
    document.addEventListener('keydown', e => { if (e.key === 'Escape') window.close(); });
  </script>
</body>
</html>
```

Nota: el botón cierre usa el carácter `✕` (U+2715). Para insertarlo en el editor, cópialo de aquí: `✕`.

- [ ] **Step 2: Verificar que el archivo existe**

```bash
ls -la /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App/starter/viewer.html
```

Esperado: el archivo aparece listado.

- [ ] **Step 3: Commit**

```bash
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App add starter/viewer.html
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App commit -m "feat: add full-screen screenshot viewer page"
```

---

## Task 2: Crear `tab.html`

**Files:**
- Create: `starter/tab.html`

Comparte los mismos IDs de elementos que `popup.html` para que `popup.js` funcione sin cambios de DOM. El body no tiene tamaño fijo y el contenido está centrado en `max-width: 640px`. No incluye el botón `#expand` (en modo tab no se necesita abrir otro tab).

- [ ] **Step 1: Crear el archivo**

Contenido completo de `starter/tab.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<style>
  :root {
    --bg:#fafaf9; --surface:#fff; --sunk:#f4f4f2;
    --text:#1c1c1a; --muted:#8a8a85; --faint:#b9b9b3;
    --border:#ececea; --border-strong:#dededb; --hover:#f4f4f2;
    --accent:#1c1c1a; --on-accent:#fff;
    --p-alta:oklch(0.63 0.18 25); --p-media:oklch(0.74 0.15 75); --p-baja:oklch(0.62 0.12 250);
    --radius:9px; --row:10px;
    --mono:'Geist Mono', ui-monospace, monospace;
  }
  html[data-theme="dark"] {
    --bg:#161614; --surface:#1e1e1c; --sunk:#1a1a18;
    --text:#f2f2ef; --muted:#8f8f8a; --faint:#5c5c58;
    --border:#2a2a27; --border-strong:#33332f; --hover:#242421;
  }
  * { box-sizing:border-box; }
  body {
    margin:0; width:100%; min-height:100vh; display:flex; flex-direction:column;
    align-items:center; background:var(--bg); color:var(--text); overflow:auto;
    font-family:'Geist', system-ui, 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing:antialiased;
  }
  .tab-root {
    width:100%; max-width:640px; min-height:100vh;
    display:flex; flex-direction:column; background:var(--surface);
  }
  .head { display:flex; align-items:center; justify-content:space-between;
    padding:15px 16px 12px; border-bottom:1px solid var(--border); }
  .head h1 { margin:0; font-size:17px; font-weight:600; letter-spacing:-.01em; }
  .count { font-family:var(--mono); font-size:11px; color:var(--muted); margin-top:2px; white-space:nowrap; }
  .icon-btn { width:32px; height:32px; display:grid; place-items:center; cursor:pointer;
    background:transparent; border:1px solid var(--border); border-radius:var(--radius); color:var(--muted); }
  .tabs { display:flex; gap:6px; padding:11px 16px; border-bottom:1px solid var(--border); overflow-x:auto; }
  .chip { flex-shrink:0; display:flex; align-items:center; gap:6px; padding:5px 11px; border-radius:999px;
    cursor:pointer; font:500 12.5px 'Geist',system-ui,sans-serif; border:1px solid var(--border);
    background:transparent; color:var(--muted); transition:all .14s; }
  .chip .n { font-family:var(--mono); font-size:10.5px; opacity:.6; }
  .chip.active { background:var(--accent); color:var(--on-accent); border-color:transparent; }
  .chip.active .n { opacity:.8; }
  .list { flex:1; overflow-y:auto; padding:6px 8px 10px; }
  .row { display:flex; align-items:flex-start; gap:11px; padding:var(--row) 8px; border-radius:var(--radius); }
  .row:hover { background:var(--hover); }
  .cbx { flex-shrink:0; margin-top:1px; width:20px; height:20px; cursor:pointer; border-radius:min(var(--radius),10px);
    border:1.6px solid var(--border-strong); background:transparent; display:grid; place-items:center; color:var(--on-accent); transition:all .14s; }
  .cbx.done { background:var(--accent); border-color:var(--accent); }
  .body { flex:1; min-width:0; }
  .ttl { font-size:14.5px; line-height:1.35; letter-spacing:-.005em; word-break:break-word; }
  .row.done .ttl { color:var(--faint); text-decoration:line-through; text-decoration-color:var(--faint); }
  .meta { display:flex; align-items:center; gap:10px; margin-top:5px; }
  .prio { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--muted); background:none; border:none; cursor:pointer; padding:0; }
  .dot { width:7px; height:7px; border-radius:999px; }
  .due { display:flex; align-items:center; gap:4px; font-family:var(--mono); font-size:10.5px; color:var(--muted); white-space:nowrap; }
  .due.overdue { color:var(--p-alta); font-weight:500; }
  .thumb { display:block; margin-top:7px; padding:0; border:1px solid var(--border); border-radius:min(var(--radius),10px);
    overflow:hidden; background:var(--sunk); cursor:zoom-in; line-height:0; }
  .thumb img { display:block; width:104px; height:64px; object-fit:cover; }
  .del { flex-shrink:0; width:24px; height:24px; display:grid; place-items:center; cursor:pointer; background:none;
    border:none; color:var(--faint); opacity:0; transition:opacity .12s; border-radius:var(--radius); }
  .row:hover .del { opacity:1; }
  .sec { display:flex; align-items:center; gap:8px; padding:14px 8px 6px; font-family:var(--mono);
    font-size:10.5px; color:var(--faint); text-transform:uppercase; letter-spacing:.08em; }
  .sec .line { flex:1; height:1px; background:var(--border); }
  .compose { border:1px solid var(--accent); border-radius:11px; padding:10px; margin:2px 0 8px; background:var(--bg); }
  .compose .lbl { display:flex; align-items:center; gap:7px; margin-bottom:9px; font-family:var(--mono);
    font-size:10.5px; color:var(--muted); text-transform:uppercase; letter-spacing:.07em; }
  .compose img { display:block; width:100%; height:116px; object-fit:cover; border-radius:var(--radius); border:1px solid var(--border); margin-bottom:9px; }
  .compose input { width:100%; border:1px solid var(--border); outline:none; background:var(--surface);
    border-radius:var(--radius); padding:9px 11px; font:14px 'Geist',system-ui,sans-serif; color:var(--text); margin-bottom:9px; }
  .compose .acts { display:flex; gap:7px; }
  .btn-primary { flex:1; padding:8px; border-radius:var(--radius); border:none; cursor:pointer;
    background:var(--accent); color:var(--on-accent); font:600 13px 'Geist',system-ui,sans-serif; }
  .btn-ghost { padding:8px 14px; border-radius:var(--radius); cursor:pointer; border:1px solid var(--border);
    background:transparent; color:var(--muted); font:500 13px 'Geist',system-ui,sans-serif; }
  .add-wrap { border-top:1px solid var(--border); background:var(--bg); padding:10px 12px; }
  .add-row { display:flex; align-items:center; gap:8px; background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius); padding:8px; transition:border-color .14s; }
  .add-row:focus-within { border-color:var(--accent); }
  .add-row input { flex:1; border:none; outline:none; background:transparent; font:14px 'Geist',system-ui,sans-serif; color:var(--text); min-width:0; }
  .cam, .add-btn { flex-shrink:0; width:30px; height:30px; border-radius:7px; display:grid; place-items:center; cursor:pointer; }
  .cam { border:1px solid var(--border); background:transparent; color:var(--muted); }
  .add-btn { border:none; background:var(--sunk); color:var(--faint); }
  .add-btn.on { background:var(--accent); color:var(--on-accent); }
  .lightbox { position:fixed; inset:0; z-index:30; cursor:zoom-out; background:rgba(12,12,11,.72);
    display:none; align-items:center; justify-content:center; padding:22px; }
  .lightbox.show { display:flex; }
  .lightbox img { max-width:100%; max-height:100%; border-radius:11px; box-shadow:0 20px 50px rgba(0,0,0,.5); }
  .empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;
    gap:10px; color:var(--faint); text-align:center; padding:24px; }
  .empty .circle { width:44px; height:44px; border-radius:999px; border:1.6px solid var(--border); display:grid; place-items:center; }
</style>
</head>
<body>
  <div class="tab-root">
    <div class="head">
      <div>
        <h1>Tareas</h1>
        <div class="count" id="count">—</div>
      </div>
      <button class="icon-btn" id="theme" title="Cambiar tema"></button>
    </div>

    <div class="tabs" id="tabs"></div>
    <div class="list" id="list"></div>

    <div class="add-wrap">
      <div class="add-row">
        <button class="cam" id="cam" title="Tarea con captura de pantalla"></button>
        <input id="draft" placeholder="Agregar tarea..." />
        <button class="add-btn" id="add"></button>
      </div>
    </div>

    <div class="lightbox" id="lightbox"><img id="lightbox-img" alt="captura" /></div>
  </div>

  <script src="popup.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verificar que el archivo existe**

```bash
ls -la /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App/starter/tab.html
```

Esperado: el archivo aparece listado.

- [ ] **Step 3: Commit**

```bash
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App add starter/tab.html
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App commit -m "feat: add full-page tab view"
```

---

## Task 3: Añadir botón expand a `popup.html`

**Files:**
- Modify: `starter/popup.html` (sección `.head`, líneas 100–107)

- [ ] **Step 1: Reemplazar el bloque `.head`**

Localizar (líneas 100–107):

```html
  <div class="head">
    <div>
      <h1>Tareas</h1>
      <div class="count" id="count">—</div>
    </div>
    <button class="icon-btn" id="theme" title="Cambiar tema"></button>
  </div>
```

Reemplazar por:

```html
  <div class="head">
    <div>
      <h1>Tareas</h1>
      <div class="count" id="count">—</div>
    </div>
    <div style="display:flex;gap:6px;">
      <button class="icon-btn" id="expand" title="Abrir en pestaña"></button>
      <button class="icon-btn" id="theme" title="Cambiar tema"></button>
    </div>
  </div>
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App add starter/popup.html
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App commit -m "feat: add expand button to popup header"
```

---

## Task 4: Actualizar `popup.js`

**Files:**
- Modify: `starter/popup.js`

Cuatro cambios en el mismo archivo. Todos son aditivos salvo el último (que reemplaza un bloque en `wire()`).

- [ ] **Step 1: Añadir SVG expand al objeto `SVG`**

Al final del objeto `SVG` (después de la entrada `moon`, antes del cierre `}`), añadir:

```js
  expand: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
```

- [ ] **Step 2: Añadir constante `IS_TAB`**

Después de la línea `const $ = (id) => document.getElementById(id);` (línea 94), insertar:

```js
const IS_TAB = location.pathname.includes('tab.html');
```

- [ ] **Step 3: Registrar el botón expand en `init()`**

Dentro de `async function init()`, después de la línea `$('cam').addEventListener('click', startCapture);`, añadir:

```js
  const expandBtn = $('expand');
  if (expandBtn) {
    expandBtn.innerHTML = SVG.expand;
    if (IS_TAB) {
      expandBtn.style.display = 'none';
    } else {
      expandBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('tab.html') });
      });
    }
  }
```

Nota: `expandBtn.innerHTML = SVG.expand` es seguro aquí porque `SVG.expand` es una constante literal definida en el código fuente, no entrada del usuario.

- [ ] **Step 4: Redirigir zoom de capturas a `viewer.html`**

Dentro de `function wire(list)`, localizar el bloque:

```js
  list.querySelectorAll('[data-zoom]').forEach(b => b.onclick = () => {
    const t = tasks.find(t => t.id===+b.dataset.zoom);
    if (t?.shot) { $('lightbox-img').src = t.shot; $('lightbox').classList.add('show'); }
  });
```

Reemplazar por:

```js
  list.querySelectorAll('[data-zoom]').forEach(b => b.onclick = () => {
    const t = tasks.find(t => t.id === +b.dataset.zoom);
    if (!t?.shot) return;
    if (window.chrome?.storage?.local) {
      chrome.storage.local.set({ todo_preview_img: t.shot }, () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('viewer.html') });
      });
    } else {
      $('lightbox-img').src = t.shot;
      $('lightbox').classList.add('show');
    }
  });
```

- [ ] **Step 5: Verificar manualmente en Chrome**

1. Abre `chrome://extensions`
2. Activa "Modo de desarrollador" (esquina superior derecha)
3. Haz clic en "Cargar descomprimida" y selecciona la carpeta `starter/`
   (Si ya estaba cargada, haz clic en el ícono de recarga circular de la extensión)
4. Haz clic en el ícono de la extensión "Tareas" en la barra de Chrome

Verificar botón expand:
- El header del popup muestra dos botones (expand + tema)
- Clic en el expand abre una nueva pestaña con las tareas a pantalla completa
- En esa pestaña, el botón expand NO aparece (solo el toggle de tema)

Verificar viewer de capturas:
- En el popup, haz clic en la cámara para crear una tarea con captura y guárdala
- Haz clic en la miniatura de la captura
- Se abre una nueva pestaña con la imagen a pantalla completa sobre fondo negro
- El botón ✕ cierra la pestaña; la tecla Escape también la cierra

- [ ] **Step 6: Commit**

```bash
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App add starter/popup.js
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App commit -m "feat: expand button opens tab, thumbnails open full-screen viewer"
```
