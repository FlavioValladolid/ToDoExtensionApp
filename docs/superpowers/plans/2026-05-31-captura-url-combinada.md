# Captura + URL Combinada y Subtítulo de Página — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que una tarea contenga captura de pantalla y URL al mismo tiempo, y mostrar el título de la pestaña como subtítulo en la fila de la tarea.

**Architecture:** `captureUrl()` pasa a devolver `{ url, pageTitle }`. Se añade `draftPageTitle` al estado. `saveCompose()` incluye ambos campos. `rowHTML()` renderiza un subtítulo `.page-title` entre el título y el `.meta`.

**Tech Stack:** HTML/CSS/JS vanilla, Chrome Extension MV3, `chrome.tabs.query`.

---

### Task 1: CSS `.page-title` en popup.html y tab.html

**Files:**
- Modify: `starter/popup.html` (sección CSS, ~línea 89-91 junto a `.url-link`)
- Modify: `starter/tab.html` (sección CSS, ~línea 88-90 junto a `.url-link`)

- [ ] **Step 1: Añadir CSS en popup.html**

Busca el bloque `.url-link img { border-radius:2px; flex-shrink:0; }` en `starter/popup.html` (~línea 91) y añade inmediatamente después:

```css
  .page-title { font-size:11.5px; color:var(--muted); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .row.done .page-title { color:var(--faint); }
```

- [ ] **Step 2: Verificar visualmente en popup.html**

Abre `starter/popup.html` en el editor y confirma que las dos líneas CSS están presentes después de `.url-link img`.

- [ ] **Step 3: Añadir el mismo CSS en tab.html**

Busca `.url-link img { border-radius:2px; flex-shrink:0; }` en `starter/tab.html` (~línea 90) y añade inmediatamente después:

```css
  .page-title { font-size:11.5px; color:var(--muted); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .row.done .page-title { color:var(--faint); }
```

- [ ] **Step 4: Commit**

```bash
git add starter/popup.html starter/tab.html
git commit -m "feat: add page-title CSS for task subtitle"
```

---

### Task 2: popup.js — captureUrl(), estado y url-btn handler

**Files:**
- Modify: `starter/popup.js:88-100` (captureUrl, estado) y `starter/popup.js:117-121` (url-btn handler)

- [ ] **Step 1: Cambiar `captureUrl()` para devolver objeto**

Localiza `captureUrl()` en `starter/popup.js` (~línea 88-92):

```js
async function captureUrl() {
  if (!window.chrome?.tabs) return null;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url || null;
}
```

Reemplaza por:

```js
async function captureUrl() {
  if (!window.chrome?.tabs) return { url: null, pageTitle: null };
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return { url: tab?.url || null, pageTitle: tab?.title || null };
}
```

- [ ] **Step 2: Añadir `draftPageTitle` al estado**

Localiza la línea del estado (~línea 100):

```js
let draftPrio = 'none', draftCat = 'personal', draftDue = null, draftUrl = null;
```

Reemplaza por:

```js
let draftPrio = 'none', draftCat = 'personal', draftDue = null, draftUrl = null, draftPageTitle = null;
```

- [ ] **Step 3: Actualizar el handler del url-btn en `init()`**

Localiza el handler del url-btn (~línea 117-121):

```js
    urlBtn.addEventListener('click', async () => {
      if (draftUrl) { draftUrl = null; syncUrlBtn(); return; }
      draftUrl = await captureUrl();
      syncUrlBtn();
    });
```

Reemplaza por:

```js
    urlBtn.addEventListener('click', async () => {
      if (draftUrl) { draftUrl = null; draftPageTitle = null; syncUrlBtn(); return; }
      const { url, pageTitle } = await captureUrl();
      draftUrl = url;
      draftPageTitle = pageTitle;
      syncUrlBtn();
    });
```

- [ ] **Step 4: Verificar manualmente**

Carga la extensión en Chrome (`chrome://extensions` → Recargar). Haz clic en `🔗` sobre una pestaña activa. Abre DevTools → Console y ejecuta:

```js
// No hay forma directa de inspeccionar el estado interno, pero puedes verificar
// que el botón muestra clase "on" después de hacer clic
document.getElementById('url-btn').className
// Expected: "cam on"
```

- [ ] **Step 5: Commit**

```bash
git add starter/popup.js
git commit -m "feat: captureUrl returns pageTitle, add draftPageTitle state"
```

---

### Task 3: popup.js — saveCompose(), addDraft(), handlers, rowHTML()

**Files:**
- Modify: `starter/popup.js:264-288` (handlers cancel/Escape, saveCompose, addDraft)
- Modify: `starter/popup.js:185-197` (rowHTML)

- [ ] **Step 1: Actualizar handler Escape en compose card**

Localiza (~línea 264):

```js
    name.onkeydown = (e) => { if (e.key==='Enter') saveCompose(); if (e.key==='Escape') { compose=null; draftUrl=null; syncUrlBtn(); render(); } };
```

Reemplaza por:

```js
    name.onkeydown = (e) => { if (e.key==='Enter') saveCompose(); if (e.key==='Escape') { compose=null; draftUrl=null; draftPageTitle=null; syncUrlBtn(); render(); } };
```

- [ ] **Step 2: Actualizar handler cancel en compose card**

Localiza (~línea 266):

```js
    $('compose-cancel').onclick = () => { compose = null; draftUrl = null; syncUrlBtn(); render(); };
```

Reemplaza por:

```js
    $('compose-cancel').onclick = () => { compose = null; draftUrl = null; draftPageTitle = null; syncUrlBtn(); render(); };
```

- [ ] **Step 3: Actualizar `saveCompose()` para incluir url y pageTitle**

Localiza `saveCompose()` (~línea 275-281):

```js
function saveCompose() {
  if (!compose) return;
  const name = (compose.name || '').trim() || 'Captura de pantalla';
  tasks = [{ id: Date.now(), text: name, done: false, priority: 'none',
    cat: filter !== 'todas' ? filter : 'personal', due: null, shot: compose.shot }, ...tasks];
  compose = null; draftUrl = null; syncUrlBtn(); commit();
}
```

Reemplaza por:

```js
function saveCompose() {
  if (!compose) return;
  const name = (compose.name || '').trim() || 'Captura de pantalla';
  tasks = [{ id: Date.now(), text: name, done: false, priority: 'none',
    cat: filter !== 'todas' ? filter : 'personal', due: null, shot: compose.shot,
    url: draftUrl || undefined, pageTitle: draftPageTitle || undefined }, ...tasks];
  compose = null; draftUrl = null; draftPageTitle = null; syncUrlBtn(); commit();
}
```

- [ ] **Step 4: Actualizar `addDraft()` para incluir pageTitle**

Localiza `addDraft()` (~línea 282-288):

```js
function addDraft() {
  const v = $('draft').value.trim();
  if (!v) return;
  tasks = [{ id: Date.now(), text: v, done: false, priority: draftPrio,
    cat: filter !== 'todas' ? filter : draftCat, due: draftDue, url: draftUrl || undefined }, ...tasks];
  $('draft').value = ''; draftPrio = 'none'; draftDue = null; draftUrl = null; syncAddBtn(); syncUrlBtn(); commit();
}
```

Reemplaza por:

```js
function addDraft() {
  const v = $('draft').value.trim();
  if (!v) return;
  tasks = [{ id: Date.now(), text: v, done: false, priority: draftPrio,
    cat: filter !== 'todas' ? filter : draftCat, due: draftDue,
    url: draftUrl || undefined, pageTitle: draftPageTitle || undefined }, ...tasks];
  $('draft').value = ''; draftPrio = 'none'; draftDue = null; draftUrl = null; draftPageTitle = null; syncAddBtn(); syncUrlBtn(); commit();
}
```

- [ ] **Step 5: Actualizar `rowHTML()` para renderizar el subtítulo**

Localiza en `rowHTML()` (~línea 195) la línea:

```js
    <div class="body"><div class="ttl">${escapeHtml(t.text)}</div>${meta}${thumb}</div>
```

Reemplaza por:

```js
    <div class="body"><div class="ttl">${escapeHtml(t.text)}</div>${t.pageTitle ? `<div class="page-title">${escapeHtml(t.pageTitle)}</div>` : ''}${meta}${thumb}</div>
```

- [ ] **Step 6: Verificar manualmente — flujo URL + texto**

En Chrome con la extensión cargada:
1. Navega a cualquier página (ej. google.com)
2. Haz clic en `🔗` — botón se resalta
3. Escribe una tarea en el campo de texto y presiona Enter
4. La tarea debe mostrar debajo del título: el nombre de la pestaña en gris
5. También debe mostrar `🔗 google.com` en el metadata

- [ ] **Step 7: Verificar manualmente — flujo screenshot + URL**

1. Haz clic en `🔗` — botón se resalta
2. Haz clic en `📷` — aparece la compose card
3. Escribe un nombre y guarda
4. La tarea debe tener thumbnail de captura + URL (`🔗 dominio`) + subtítulo (nombre de la página)

- [ ] **Step 8: Verificar tarea completada**

1. Marca como completada una tarea que tiene `pageTitle`
2. El subtítulo debe aparecer en color `--faint` (más apagado) junto con el título tachado

- [ ] **Step 9: Commit**

```bash
git add starter/popup.js
git commit -m "feat: combined screenshot+URL tasks and page title subtitle"
```
