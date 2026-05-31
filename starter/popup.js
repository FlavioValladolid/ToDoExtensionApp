/* popup.js — lógica de la extensión de tareas (vanilla JS, sin dependencias)
   Recreación del prototipo de diseño. Funciona dentro de Chrome (chrome.storage +
   chrome.tabs.captureVisibleTab) y también standalone en el navegador (fallbacks). */

const PRIORITIES = {
  none:  { label: 'Sin prioridad', dot: 'transparent' },
  alta:  { label: 'Alta',  dot: 'var(--p-alta)' },
  media: { label: 'Media', dot: 'var(--p-media)' },
  baja:  { label: 'Baja',  dot: 'var(--p-baja)' },
};
const PRIO_CYCLE = ['none', 'alta', 'media', 'baja'];
const CATS = [
  { id: 'trabajo', label: 'Trabajo' },
  { id: 'personal', label: 'Personal' },
  { id: 'compras', label: 'Compras' },
];

/* ---------- iconos SVG ---------- */
const SVG = {
  check: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  cal: '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>',
  cam: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a2 2 0 0 1 2-2h2l1.2-1.6a1 1 0 0 1 .8-.4h4a1 1 0 0 1 .8.4L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="12.5" r="3.2"/></svg>',
  sun: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  expand: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
  link: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
};

/* ---------- fechas ---------- */
const DOW = ['dom','lun','mar','mié','jue','vie','sáb'];
const MON = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const todayISO = () => { const d = new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); };
const isoToDate = (iso) => { const [y,m,d] = iso.split('-').map(Number); return new Date(y, m-1, d); };
function fmtDue(iso) {
  if (!iso) return null;
  const d = isoToDate(iso); d.setHours(0,0,0,0);
  const diff = Math.round((d - isoToDate(todayISO())) / 86400000);
  let label;
  if (diff === 0) label = 'Hoy'; else if (diff === 1) label = 'Mañana';
  else if (diff === -1) label = 'Ayer'; else label = `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
  return { label, overdue: diff < 0, soon: diff === 0 || diff === 1 };
}

function fmtCreated(id) {
  const d = new Date(id);
  return `${d.getDate()} ${MON[d.getMonth()]}`;
}

/* ---------- almacenamiento ---------- */
const KEY = 'todo_tasks';
async function loadTasks() {
  if (window.chrome?.storage?.local) {
    const r = await chrome.storage.local.get(KEY);
    return r[KEY] || seed();
  }
  try { return JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { return seed(); }
}
async function saveTasks(tasks) {
  if (window.chrome?.storage?.local) return chrome.storage.local.set({ [KEY]: tasks });
  localStorage.setItem(KEY, JSON.stringify(tasks));
}
function seed() {
  const add = (n) => { const d = isoToDate(todayISO()); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
  return [
    { id: 1, text: 'Enviar propuesta a cliente', done: false, priority: 'alta', cat: 'trabajo', due: todayISO() },
    { id: 2, text: 'Revisar pull request del equipo', done: false, priority: 'media', cat: 'trabajo', due: add(1) },
    { id: 3, text: 'Comprar café y avena', done: false, priority: 'baja', cat: 'compras', due: null },
    { id: 4, text: 'Reservar mesa para el viernes', done: false, priority: 'none', cat: 'personal', due: add(3) },
    { id: 5, text: 'Pagar suscripción de música', done: true, priority: 'none', cat: 'personal', due: null },
  ];
}

/* ---------- captura de pantalla ---------- */
async function capture() {
  // En la extensión: captura la pestaña visible.
  if (window.chrome?.tabs?.captureVisibleTab) {
    try { return await chrome.tabs.captureVisibleTab(null, { format: 'png' }); }
    catch (e) { /* sin permiso o página protegida → fallback */ }
  }
  // Fallback standalone: dibuja una representación en canvas.
  const w = 340, h = 210, cv = document.createElement('canvas');
  cv.width = w*2; cv.height = h*2; const x = cv.getContext('2d'); x.scale(2,2);
  const rr = (a,b,c,d,r) => { x.beginPath(); x.roundRect(a,b,c,d,r); x.fill(); };
  x.fillStyle = '#fff'; x.fillRect(0,0,w,h);
  x.fillStyle = '#eeeeea'; rr(24,38,30,30,8);
  x.fillStyle = '#e6e6e2'; rr(64,42,120,8,4); rr(24,92,240,8,4); rr(24,106,280,8,4); rr(24,120,250,8,4);
  x.fillStyle = '#f3f3ef'; [24,132,240].forEach(cx => rr(cx,158,76,40,8));
  return cv.toDataURL('image/png');
}

async function captureUrl() {
  if (!window.chrome?.tabs) return { url: null, pageTitle: null };
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return { url: tab?.url || null, pageTitle: tab?.title || null };
}

/* =========================================================================
   estado + render
   ========================================================================= */
let tasks = [];
let filter = 'todas';
let compose = null;          // { shot, name }
let draftPrio = 'none', draftCat = 'personal', draftDue = null, draftUrl = null, draftPageTitle = null;

const $ = (id) => document.getElementById(id);
const IS_TAB = location.pathname.includes('tab.html');

async function init() {
  tasks = await loadTasks();
  // tema
  const saved = localStorage.getItem('todo_theme');
  if (saved === 'dark') document.documentElement.dataset.theme = 'dark';
  $('theme').addEventListener('click', toggleTheme);
  $('cam').innerHTML = SVG.cam;
  $('add').innerHTML = SVG.plus;
  $('cam').addEventListener('click', startCapture);
  const urlBtn = $('url-btn');
  if (urlBtn) {
    urlBtn.innerHTML = SVG.link;
    urlBtn.addEventListener('click', async () => {
      if (draftUrl) { draftUrl = null; draftPageTitle = null; syncUrlBtn(); return; }
      const { url, pageTitle } = await captureUrl();
      draftUrl = url;
      draftPageTitle = pageTitle;
      syncUrlBtn();
    });
  }
  const expandBtn = $('expand');
  if (expandBtn) {
    expandBtn.innerHTML = SVG.expand;
    if (IS_TAB) {
      expandBtn.style.display = 'none';
    } else {
      expandBtn.addEventListener('click', () => {
        if (window.chrome?.tabs) {
          chrome.tabs.create({ url: chrome.runtime.getURL('tab.html') });
        }
      });
    }
  }
  $('add').addEventListener('click', addDraft);
  $('draft').addEventListener('input', syncAddBtn);
  $('draft').addEventListener('keydown', (e) => { if (e.key === 'Enter') addDraft(); });
  $('lightbox').addEventListener('click', () => $('lightbox').classList.remove('show'));
  renderTabs(); render(); syncTheme();
}

function toggleTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = dark ? '' : 'dark';
  localStorage.setItem('todo_theme', dark ? 'light' : 'dark');
  syncTheme();
}
function syncTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  $('theme').innerHTML = dark ? SVG.sun : SVG.moon;
}
function syncAddBtn() { $('add').classList.toggle('on', !!$('draft').value.trim()); }
function syncUrlBtn() {
  const btn = $('url-btn');
  if (btn) btn.classList.toggle('on', !!draftUrl);
}

function commit() { saveTasks(tasks); render(); renderTabs(); }

function renderTabs() {
  const wrap = $('tabs');
  const pendBy = (id) => tasks.filter(t => !t.done && (id === 'todas' || t.cat === id)).length;
  const items = [{ id: 'todas', label: 'Todas' }, ...CATS];
  wrap.innerHTML = items.map(c =>
    `<button class="chip ${filter===c.id?'active':''}" data-f="${c.id}">${c.label}<span class="n">${pendBy(c.id)}</span></button>`
  ).join('');
  wrap.querySelectorAll('.chip').forEach(b => b.onclick = () => {
    filter = b.dataset.f;
    if (filter !== 'todas') draftCat = filter;
    renderTabs(); render();
  });
}

function urlLink(url) {
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) return '';
    const domain = parsed.hostname.replace(/^www\./, '');
    const favicon = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=16';
    return '<a class="url-link" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer"><img class="url-favicon" src="' + favicon + '" width="12" height="12" alt="">' + escapeHtml(domain) + '</a>';
  } catch { return ''; }
}

function rowHTML(t) {
  const due = fmtDue(t.due), p = PRIORITIES[t.priority];
  const meta = !t.done ? `<div class="meta">
    ${t.priority !== 'none' ? `<button class="prio" data-prio="${t.id}"><span class="dot" style="background:${p.dot}"></span>${p.label}</button>` : ''}
    ${due ? `<span class="due ${due.overdue?'overdue':''}">${SVG.cal} ${due.label}</span>` : ''}
    ${t.url ? urlLink(t.url) : ''}
    <span class="due">${fmtCreated(t.id)}</span>
  </div>` : '';
  const thumb = t.shot ? `<button class="thumb" data-zoom="${t.id}"><img src="${t.shot}" alt="captura"></button>` : '';
  return `<div class="row ${t.done?'done':''}" data-id="${t.id}">
    <button class="cbx ${t.done?'done':''}" data-toggle="${t.id}">${t.done?SVG.check:''}</button>
    <div class="body"><div class="ttl">${escapeHtml(t.text)}</div>${t.pageTitle ? `<div class="page-title">${escapeHtml(t.pageTitle)}</div>` : ''}${meta}${thumb}</div>
    <button class="del" data-del="${t.id}">${SVG.x}</button>
  </div>`;
}

function render() {
  const list = $('list');
  const visible = tasks.filter(t => filter === 'todas' || t.cat === filter);
  const pw = { alta:0, media:1, baja:2, none:3 };
  const pend = visible.filter(t => !t.done).sort((a,b) => (pw[a.priority]-pw[b.priority]) || ((a.due||'9999')<(b.due||'9999')?-1:1));
  const done = visible.filter(t => t.done);
  const pendCount = visible.filter(t => !t.done).length;
  $('count').textContent = pendCount === 0 ? 'todo listo' : `${pendCount} pendiente${pendCount>1?'s':''}`;

  let html = '';
  if (compose) html += composeHTML();
  if (pend.length === 0 && done.length === 0 && !compose) {
    html += `<div class="empty"><div class="circle">${SVG.check}</div>
      <div style="font-size:13.5px;color:var(--muted)">Nada por aquí</div>
      <div style="font-size:12px;color:var(--faint)">Agrega tu primera tarea abajo</div></div>`;
  }
  html += pend.map(rowHTML).join('');
  if (done.length) html += `<div class="sec">Completadas<span class="line"></span>${done.length}</div>` + done.map(rowHTML).join('');
  list.innerHTML = html;
  wire(list);
}

function composeHTML() {
  return `<div class="compose">
    <div class="lbl">${SVG.cam} Nueva captura</div>
    ${compose.shot ? `<img src="${compose.shot}" alt="captura">` : ''}
    <input id="compose-name" placeholder="Nombre de la actividad…" value="${escapeHtml(compose.name)}">
    <div class="acts">
      <button class="btn-primary" id="compose-save">Guardar tarea</button>
      <button class="btn-ghost" id="compose-cancel">Cancelar</button>
    </div>
  </div>`;
}

function wire(list) {
  list.querySelectorAll('[data-toggle]').forEach(b => b.onclick = () => {
    const id = +b.dataset.toggle; tasks = tasks.map(t => t.id===id?{...t,done:!t.done}:t); commit();
  });
  list.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const id = +b.dataset.del; tasks = tasks.filter(t => t.id!==id); commit();
  });
  list.querySelectorAll('[data-prio]').forEach(b => b.onclick = () => {
    const id = +b.dataset.prio; tasks = tasks.map(t => t.id===id?{...t,priority:PRIO_CYCLE[(PRIO_CYCLE.indexOf(t.priority)+1)%4]}:t); commit();
  });
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
  list.querySelectorAll('.url-favicon').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });
  // compose card
  const name = $('compose-name');
  if (name) {
    name.focus();
    name.oninput = () => compose.name = name.value;
    name.onkeydown = (e) => { if (e.key==='Enter') saveCompose(); if (e.key==='Escape') { compose=null; draftUrl=null; draftPageTitle=null; syncUrlBtn(); render(); } };
    $('compose-save').onclick = saveCompose;
    $('compose-cancel').onclick = () => { compose = null; draftUrl = null; draftPageTitle = null; syncUrlBtn(); render(); };
  }
}

async function startCapture() {
  const shot = await capture();
  compose = { shot, name: '' };
  render();
}
function saveCompose() {
  if (!compose) return;
  const name = (compose.name || '').trim() || 'Captura de pantalla';
  tasks = [{ id: Date.now(), text: name, done: false, priority: 'none',
    cat: filter !== 'todas' ? filter : 'personal', due: null, shot: compose.shot,
    url: draftUrl || undefined, pageTitle: draftPageTitle || undefined }, ...tasks];
  compose = null; draftUrl = null; draftPageTitle = null; syncUrlBtn(); commit();
}
function addDraft() {
  const v = $('draft').value.trim();
  if (!v) return;
  tasks = [{ id: Date.now(), text: v, done: false, priority: draftPrio,
    cat: filter !== 'todas' ? filter : draftCat, due: draftDue,
    url: draftUrl || undefined, pageTitle: draftPageTitle || undefined }, ...tasks];
  $('draft').value = ''; draftPrio = 'none'; draftDue = null; draftUrl = null; draftPageTitle = null; syncAddBtn(); syncUrlBtn(); commit();
}

function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

init();
