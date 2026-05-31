# URL en Tareas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir un botón de enlace en el add-bar que captura la URL de la pestaña activa y la adjunta a la próxima tarea, mostrándola como favicon + dominio clickeable en la fila de la tarea.

**Architecture:** `draftUrl` es una variable de estado que funciona igual que `draftPrio` y `draftDue`. Los cambios CSS y HTML van primero (Tasks 1-2), la lógica JS va después (Task 3). La función `urlLink()` genera el HTML del enlace; `wire()` añade el handler de error del favicon via JS para cumplir con la CSP de MV3 (no atributos inline).

**Tech Stack:** Vanilla JS, Chrome Extension MV3, chrome.tabs.query, Google Favicons API (s2/favicons)

---

## File Map

| Accion | Archivo | Cambio |
|---|---|---|
| Modificar | starter/popup.html | Extender .cam.on, añadir .url-link CSS, añadir #url-btn HTML |
| Modificar | starter/tab.html | Mismos cambios CSS y HTML |
| Modificar | starter/popup.js | SVG link, draftUrl, captureUrl(), syncUrlBtn(), wire en init(), addDraft(), urlLink(), rowHTML(), wire() |

---

## Task 1: CSS en popup.html y tab.html

**Files:**
- Modify: starter/popup.html (linea 88)
- Modify: starter/tab.html (linea 87)

- [ ] **Step 1: Extender .add-btn.on en popup.html**

Localizar en popup.html linea 88:

    .add-btn.on { background:var(--accent); color:var(--on-accent); }

Reemplazar por:

    .cam.on, .add-btn.on { background:var(--accent); color:var(--on-accent); }
    .url-link { display:flex; align-items:center; gap:4px; font-family:var(--mono); font-size:10.5px; color:var(--muted); text-decoration:none; white-space:nowrap; }
    .url-link:hover { color:var(--text); }
    .url-link img { border-radius:2px; flex-shrink:0; }

- [ ] **Step 2: Mismos cambios en tab.html**

Localizar en tab.html linea 87:

    .add-btn.on { background:var(--accent); color:var(--on-accent); }

Reemplazar por:

    .cam.on, .add-btn.on { background:var(--accent); color:var(--on-accent); }
    .url-link { display:flex; align-items:center; gap:4px; font-family:var(--mono); font-size:10.5px; color:var(--muted); text-decoration:none; white-space:nowrap; }
    .url-link:hover { color:var(--text); }
    .url-link img { border-radius:2px; flex-shrink:0; }

- [ ] **Step 3: Verificar**

```bash
grep -n "cam.on" /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App/starter/popup.html /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App/starter/tab.html
grep -n "url-link" /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App/starter/popup.html /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App/starter/tab.html
```

Esperado: ambos archivos muestran las nuevas reglas CSS.

- [ ] **Step 4: Commit**

```bash
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App add starter/popup.html starter/tab.html
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App commit -m "feat: add url-link and cam.on CSS styles"
```

---

## Task 2: Boton #url-btn en popup.html y tab.html

**Files:**
- Modify: starter/popup.html (linea 116)
- Modify: starter/tab.html (linea 112)

- [ ] **Step 1: Añadir #url-btn en popup.html**

Localizar en popup.html (linea 116-117):

      <button class="cam" id="cam" title="Tarea con captura de pantalla"></button>
      <input id="draft" placeholder="Agregar tarea..." />

Reemplazar por:

      <button class="cam" id="cam" title="Tarea con captura de pantalla"></button>
      <button class="cam" id="url-btn" title="Guardar URL de esta pagina"></button>
      <input id="draft" placeholder="Agregar tarea..." />

- [ ] **Step 2: Añadir #url-btn en tab.html**

Localizar en tab.html (linea 112-113):

        <button class="cam" id="cam" title="Tarea con captura de pantalla"></button>
        <input id="draft" placeholder="Agregar tarea..." />

Reemplazar por:

        <button class="cam" id="cam" title="Tarea con captura de pantalla"></button>
        <button class="cam" id="url-btn" title="Guardar URL de esta pagina"></button>
        <input id="draft" placeholder="Agregar tarea..." />

- [ ] **Step 3: Verificar**

```bash
grep -n "url-btn" /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App/starter/popup.html /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App/starter/tab.html
```

Esperado: un resultado por archivo.

- [ ] **Step 4: Commit**

```bash
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App add starter/popup.html starter/tab.html
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App commit -m "feat: add url-btn to add-bar in popup and tab"
```

---

## Task 3: Logica en popup.js

**Files:**
- Modify: starter/popup.js

Nueve cambios en el mismo archivo. Cambios 1-5 y 8-9 son aditivos; cambios 6 y 7 reemplazan bloques existentes.

IMPORTANT: SVG.link uses backtick template literals internally — use the Edit tool with exact string matching, not string replacement via shell.

- [ ] **Step 1: Añadir SVG link al objeto SVG**

Localizar al final del objeto SVG (linea 27-28):

  expand: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
};

Reemplazar por:

  expand: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
  link: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
};

- [ ] **Step 2: Añadir draftUrl al estado global**

Localizar linea 93:

let draftPrio = 'none', draftCat = 'personal', draftDue = null;

Reemplazar por:

let draftPrio = 'none', draftCat = 'personal', draftDue = null, draftUrl = null;

- [ ] **Step 3: Añadir captureUrl() despues de capture()**

Localizar el fin de la funcion capture() (linea 85):

  return cv.toDataURL('image/png');
}

Insertar inmediatamente despues:

  return cv.toDataURL('image/png');
}

async function captureUrl() {
  if (!window.chrome?.tabs) return null;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url || null;
}

- [ ] **Step 4: Añadir syncUrlBtn() despues de syncAddBtn()**

Localizar linea 137:

function syncAddBtn() { $('add').classList.toggle('on', !!$('draft').value.trim()); }

Insertar inmediatamente despues:

function syncAddBtn() { $('add').classList.toggle('on', !!$('draft').value.trim()); }
function syncUrlBtn() {
  const btn = $('url-btn');
  if (btn) btn.classList.toggle('on', !!draftUrl);
}

- [ ] **Step 5: Añadir urlLink() antes de rowHTML()**

Localizar (linea 155):

function rowHTML(t) {

Insertar inmediatamente antes:

function urlLink(url) {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const favicon = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=16';
    return '<a class="url-link" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer"><img class="url-favicon" src="' + favicon + '" width="12" height="12" alt="">' + escapeHtml(domain) + '</a>';
  } catch { return ''; }
}

function rowHTML(t) {

- [ ] **Step 6: Actualizar condicion de meta en rowHTML()**

Localizar (lineas 157-160):

  const meta = (!t.done && (t.priority !== 'none' || due)) ? `<div class="meta">
    ${t.priority !== 'none' ? `<button class="prio" data-prio="${t.id}"><span class="dot" style="background:${p.dot}"></span>${p.label}</button>` : ''}
    ${due ? `<span class="due ${due.overdue?'overdue':''}">${SVG.cal} ${due.label}</span>` : ''}
  </div>` : '';

Reemplazar por:

  const meta = (!t.done && (t.priority !== 'none' || due || t.url)) ? `<div class="meta">
    ${t.priority !== 'none' ? `<button class="prio" data-prio="${t.id}"><span class="dot" style="background:${p.dot}"></span>${p.label}</button>` : ''}
    ${due ? `<span class="due ${due.overdue?'overdue':''}">${SVG.cal} ${due.label}</span>` : ''}
    ${t.url ? urlLink(t.url) : ''}
  </div>` : '';

- [ ] **Step 7: Actualizar addDraft() para incluir url**

Localizar (lineas 248-253):

function addDraft() {
  const v = $('draft').value.trim();
  if (!v) return;
  tasks = [{ id: Date.now(), text: v, done: false, priority: draftPrio,
    cat: filter !== 'todas' ? filter : draftCat, due: draftDue }, ...tasks];
  $('draft').value = ''; draftPrio = 'none'; draftDue = null; syncAddBtn(); commit();
}

Reemplazar por:

function addDraft() {
  const v = $('draft').value.trim();
  if (!v) return;
  tasks = [{ id: Date.now(), text: v, done: false, priority: draftPrio,
    cat: filter !== 'todas' ? filter : draftCat, due: draftDue, url: draftUrl || undefined }, ...tasks];
  $('draft').value = ''; draftPrio = 'none'; draftDue = null; draftUrl = null; syncAddBtn(); syncUrlBtn(); commit();
}

- [ ] **Step 8: Añadir handler de favicon en wire()**

Localizar en wire() el comentario (linea 225):

  // compose card

Insertar inmediatamente antes:

  list.querySelectorAll('.url-favicon').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });
  // compose card

- [ ] **Step 9: Wire #url-btn en init()**

Localizar en init() (linea 106):

  $('cam').addEventListener('click', startCapture);

Insertar inmediatamente despues:

  $('cam').addEventListener('click', startCapture);
  const urlBtn = $('url-btn');
  if (urlBtn) {
    urlBtn.innerHTML = SVG.link;
    urlBtn.addEventListener('click', async () => {
      if (draftUrl) { draftUrl = null; syncUrlBtn(); return; }
      draftUrl = await captureUrl();
      syncUrlBtn();
    });
  }

Note: urlBtn.innerHTML = SVG.link is safe — SVG.link is a hardcoded constant defined in this same file, not user input.

- [ ] **Step 10: Verificar en Chrome**

1. Abre chrome://extensions, recarga la extension "Tareas"
2. Navega a cualquier pagina (ej. github.com)
3. Abre el popup -> verifica que aparece el boton de enlace junto a la camara
4. Haz clic en el boton de enlace -> el boton debe resaltarse (fondo oscuro)
5. Escribe una tarea y presiona Enter -> la tarea aparece con "github.com" como link clickeable con favicon
6. Haz clic en el dominio -> abre la URL en pestana nueva
7. Clic en boton de enlace activo -> se desactiva (toggle off)

- [ ] **Step 11: Commit**

```bash
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App add starter/popup.js
git -C /Users/flaviovalladolid/Documents/Claude_Code_Projects/To_Do_App commit -m "feat: URL capture and display in task rows"
```
