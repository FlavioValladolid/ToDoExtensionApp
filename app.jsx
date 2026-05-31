/* =========================================================================
   To Do — Chrome extension popup (minimalista)
   ========================================================================= */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "density": "normal",
  "radius": "suave",
  "accent": "#1c1c1a",
  "font": "Geist"
}/*EDITMODE-END*/;

/* ---- design tokens ----------------------------------------------------- */
function theme(t) {
  const light = {
    bg: '#fafaf9', surface: '#ffffff', sunk: '#f4f4f2',
    text: '#1c1c1a', muted: '#8a8a85', faint: '#b9b9b3',
    border: '#ececea', borderStrong: '#dededb', hover: '#f4f4f2',
    overlay: 'rgba(28,28,26,0.06)',
  };
  const dark = {
    bg: '#161614', surface: '#1e1e1c', sunk: '#1a1a18',
    text: '#f2f2ef', muted: '#8f8f8a', faint: '#5c5c58',
    border: '#2a2a27', borderStrong: '#33332f', hover: '#242421',
    overlay: 'rgba(255,255,255,0.06)',
  };
  const c = t.dark ? dark : light;
  // accent contrast text
  c.accent = t.accent;
  c.onAccent = '#ffffff';
  const radius = { recto: 4, suave: 9, redondo: 16 }[t.radius] ?? 9;
  const dens = {
    compacto: { row: 7, gap: 9, font: 13.5, head: 30 },
    normal:   { row: 10, gap: 11, font: 14.5, head: 36 },
    cómodo:   { row: 14, gap: 13, font: 15.5, head: 42 },
  }[t.density] ?? { row: 10, gap: 11, font: 14.5, head: 36 };
  const family = {
    Geist: "'Geist', system-ui, sans-serif",
    Sistema: "'Helvetica Neue', system-ui, Arial, sans-serif",
    Mono: "'Geist Mono', ui-monospace, monospace",
  }[t.font] ?? "'Geist', system-ui, sans-serif";
  return { c, radius, dens, family };
}

const PRIORITIES = {
  none:  { label: 'Sin prioridad', dot: 'transparent' },
  alta:  { label: 'Alta',  dot: 'oklch(0.63 0.18 25)' },
  media: { label: 'Media', dot: 'oklch(0.74 0.15 75)' },
  baja:  { label: 'Baja',  dot: 'oklch(0.62 0.12 250)' },
};
const PRIO_CYCLE = ['none', 'alta', 'media', 'baja'];

const CATS = [
  { id: 'trabajo',  label: 'Trabajo' },
  { id: 'personal', label: 'Personal' },
  { id: 'compras',  label: 'Compras' },
];

/* ---- inline icons ------------------------------------------------------ */
const Icon = {
  check: (p) => (
    <svg viewBox="0 0 24 24" width={p.s||14} height={p.s||14} fill="none"
         stroke={p.c||'currentColor'} strokeWidth={p.w||3}
         strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
  ),
  plus: (p) => (
    <svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none"
         stroke={p.c||'currentColor'} strokeWidth={p.w||2.2}
         strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
  ),
  x: (p) => (
    <svg viewBox="0 0 24 24" width={p.s||14} height={p.s||14} fill="none"
         stroke={p.c||'currentColor'} strokeWidth={p.w||2.2}
         strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
  ),
  cal: (p) => (
    <svg viewBox="0 0 24 24" width={p.s||14} height={p.s||14} fill="none"
         stroke={p.c||'currentColor'} strokeWidth={p.w||1.9}
         strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
  ),
  cam: (p) => (
    <svg viewBox="0 0 24 24" width={p.s||14} height={p.s||14} fill="none"
         stroke={p.c||'currentColor'} strokeWidth={p.w||1.9}
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8a2 2 0 0 1 2-2h2l1.2-1.6a1 1 0 0 1 .8-.4h4a1 1 0 0 1 .8.4L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="12.5" r="3.2"/></svg>
  ),
  sun: (p) => (
    <svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none"
         stroke={p.c||'currentColor'} strokeWidth={1.9} strokeLinecap="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
  ),
  moon: (p) => (
    <svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none"
         stroke={p.c||'currentColor'} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
  ),
};

/* ---- date helpers ------------------------------------------------------ */
const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function todayISO() {
  const d = new Date(); d.setHours(0,0,0,0);
  return d.toISOString().slice(0,10);
}
function isoToDate(iso) { const [y,m,d] = iso.split('-').map(Number); return new Date(y, m-1, d); }
function fmtDue(iso) {
  if (!iso) return null;
  const d = isoToDate(iso); d.setHours(0,0,0,0);
  const t0 = isoToDate(todayISO());
  const diff = Math.round((d - t0) / 86400000);
  let label;
  if (diff === 0) label = 'Hoy';
  else if (diff === 1) label = 'Mañana';
  else if (diff === -1) label = 'Ayer';
  else label = `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
  return { label, overdue: diff < 0, soon: diff === 0 || diff === 1 };
}

/* ---- seed data --------------------------------------------------------- */
const SEED = [
  { id: 1, text: 'Enviar propuesta a cliente', done: false, priority: 'alta',  cat: 'trabajo',  due: todayISO() },
  { id: 2, text: 'Revisar pull request del equipo', done: false, priority: 'media', cat: 'trabajo', due: addDays(1) },
  { id: 3, text: 'Comprar café y avena', done: false, priority: 'baja', cat: 'compras', due: null },
  { id: 4, text: 'Reservar mesa para el viernes', done: false, priority: 'none', cat: 'personal', due: addDays(3) },
  { id: 5, text: 'Pagar suscripción de música', done: true, priority: 'none', cat: 'personal', due: null },
];
function addDays(n) { const d = isoToDate(todayISO()); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }

/* ---- simulated screen capture -----------------------------------------
   In the prototype we can't read the real tab, so we draw a representation
   of the page behind the popup onto a canvas and return a data URL.
   In a real extension this is replaced by chrome.tabs.captureVisibleTab(). */
function makeShot() {
  try {
    const w = 340, h = 210, dpr = 2;
    const cv = document.createElement('canvas');
    cv.width = w * dpr; cv.height = h * dpr;
    const x = cv.getContext('2d'); x.scale(dpr, dpr);
    const rr = (px, py, bw, bh, r) => { x.beginPath(); x.roundRect(px, py, bw, bh, r); x.fill(); };
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
    // fake browser chrome strip
    x.fillStyle = '#f3f3ef'; x.fillRect(0, 0, w, 20);
    x.fillStyle = '#dededb'; rr(10, 7, 60, 6, 3);
    // header: avatar + bars
    x.fillStyle = '#eeeeea'; rr(24, 38, 30, 30, 8);
    x.fillStyle = '#e6e6e2'; rr(64, 42, 120, 8, 4);
    x.fillStyle = '#efefeb'; rr(64, 56, 72, 7, 4);
    // paragraph
    const lines = [[24, 92, 240], [24, 106, 280], [24, 120, 250], [24, 134, 160]];
    lines.forEach(([lx, ly, lw], i) => { x.fillStyle = i === 3 ? '#efefeb' : '#e6e6e2'; rr(lx, ly, lw, 8, 4); });
    // three cards
    x.fillStyle = '#f3f3ef';
    [24, 132, 240].forEach(cx => rr(cx, 158, 76, 40, 8));
    return cv.toDataURL('image/png');
  } catch (e) { return null; }
}

const LS_KEY = 'todo_popup_tasks_v2';
// demo: one task created from a screen capture
SEED.unshift({ id: 6, text: 'Bug en el checkout', done: false, priority: 'media', cat: 'trabajo', due: todayISO(), shot: makeShot() });
function loadTasks() {
  try { const r = localStorage.getItem(LS_KEY); if (r) return JSON.parse(r); } catch (e) {}
  return SEED;
}

/* =========================================================================
   POPUP
   ========================================================================= */
function Popup({ t, setTweak }) {
  const { c, radius, dens, family } = theme(t);

  const [tasks, setTasks] = React.useState(loadTasks);
  const [filter, setFilter] = React.useState('todas');
  const [draft, setDraft] = React.useState('');
  const [dPrio, setDPrio] = React.useState('none');
  const [dCat, setDCat] = React.useState('personal');
  const [dDue, setDDue] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const dateRef = React.useRef(null);
  const [compose, setCompose] = React.useState(null); // { shot, name } | null
  const [zoom, setZoom] = React.useState(null);        // dataURL being previewed
  const composeRef = React.useRef(null);

  React.useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(tasks)); } catch (e) {}
  }, [tasks]);

  // keep add-category in sync with the active filter tab
  React.useEffect(() => {
    if (filter !== 'todas') setDCat(filter);
  }, [filter]);

  const visible = tasks.filter(x => filter === 'todas' || x.cat === filter);
  const pending = visible.filter(x => !x.done);
  const doneList = visible.filter(x => x.done);
  // sort pending: priority weight, then due date
  const pw = { alta: 0, media: 1, baja: 2, none: 3 };
  pending.sort((a,b) => (pw[a.priority]-pw[b.priority]) || ((a.due||'9999')<(b.due||'9999')?-1:1));

  function add() {
    const text = draft.trim();
    if (!text) return;
    setTasks(prev => [{ id: Date.now(), text, done: false, priority: dPrio, cat: dCat, due: dDue || null }, ...prev]);
    setDraft(''); setDPrio('none'); setDDue('');
  }
  function toggle(id) { setTasks(prev => prev.map(x => x.id===id ? {...x, done: !x.done} : x)); }
  function remove(id) { setTasks(prev => prev.filter(x => x.id !== id)); }
  function cyclePrio(id) {
    setTasks(prev => prev.map(x => {
      if (x.id !== id) return x;
      const i = PRIO_CYCLE.indexOf(x.priority);
      return { ...x, priority: PRIO_CYCLE[(i+1)%PRIO_CYCLE.length] };
    }));
  }

  // ---- screenshot task ----
  function capture() {
    const shot = makeShot();
    setCompose({ shot, name: '' });
    setTimeout(() => composeRef.current && composeRef.current.focus(), 60);
  }
  function saveCompose() {
    if (!compose) return;
    const name = compose.name.trim() || 'Captura de pantalla';
    setTasks(prev => [{
      id: Date.now(), text: name, done: false, priority: 'none',
      cat: filter !== 'todas' ? filter : 'personal', due: null, shot: compose.shot,
    }, ...prev]);
    setCompose(null);
  }

  const showOpts = focused || draft.length > 0;

  /* ---------- styles ---------- */
  const S = {
    popup: {
      width: 380, height: 540, background: c.surface, color: c.text, position: 'relative',
      borderRadius: radius + 6, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      fontFamily: family, border: `1px solid ${c.border}`,
      boxShadow: t.dark
        ? '0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4)'
        : '0 20px 60px rgba(28,28,26,0.22), 0 2px 8px rgba(28,28,26,0.08)',
    },
    head: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '15px 16px 12px', borderBottom: `1px solid ${c.border}`,
    },
    title: { fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', margin: 0 },
    count: { fontFamily: "'Geist Mono', monospace", fontSize: 11, color: c.muted, marginTop: 2, whiteSpace: 'nowrap' },
    iconBtn: {
      width: 32, height: 32, display: 'grid', placeItems: 'center', cursor: 'pointer',
      background: 'transparent', border: `1px solid ${c.border}`, borderRadius: radius,
      color: c.muted,
    },
    tabs: {
      display: 'flex', gap: 6, padding: '11px 16px', borderBottom: `1px solid ${c.border}`,
      overflowX: 'auto',
    },
    list: { flex: 1, overflowY: 'auto', padding: '6px 8px 10px' },
    addWrap: { borderTop: `1px solid ${c.border}`, background: c.bg, padding: '10px 12px' },
  };

  function Chip({ id, label }) {
    const active = filter === id;
    const cnt = id === 'todas'
      ? tasks.filter(x=>!x.done).length
      : tasks.filter(x=>x.cat===id && !x.done).length;
    return (
      <button onClick={() => setFilter(id)} style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 11px', borderRadius: 999, cursor: 'pointer',
        fontSize: 12.5, fontWeight: 500, fontFamily: family,
        border: `1px solid ${active ? 'transparent' : c.border}`,
        background: active ? c.accent : 'transparent',
        color: active ? c.onAccent : c.muted, transition: 'all .14s ease',
      }}>
        {label}
        <span style={{
          fontFamily: "'Geist Mono', monospace", fontSize: 10.5,
          opacity: active ? 0.8 : 0.6,
        }}>{cnt}</span>
      </button>
    );
  }

  function Row({ task }) {
    const [hover, setHover] = React.useState(false);
    const due = fmtDue(task.due);
    const prio = PRIORITIES[task.priority];
    return (
      <div
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: dens.gap,
          padding: `${dens.row}px 8px`, borderRadius: radius,
          background: hover ? c.hover : 'transparent', transition: 'background .12s',
        }}>
        {/* checkbox */}
        <button onClick={() => toggle(task.id)} aria-label="completar" style={{
          flexShrink: 0, marginTop: 1, width: 20, height: 20, cursor: 'pointer',
          borderRadius: Math.min(radius, 10),
          border: `1.6px solid ${task.done ? c.accent : c.borderStrong}`,
          background: task.done ? c.accent : 'transparent',
          display: 'grid', placeItems: 'center', transition: 'all .14s',
          color: c.onAccent,
        }}>
          {task.done && <Icon.check s={13} w={3.2} />}
        </button>

        {/* body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: dens.font, lineHeight: 1.35, letterSpacing: '-0.005em',
            color: task.done ? c.faint : c.text,
            textDecoration: task.done ? 'line-through' : 'none',
            textDecorationColor: c.faint, wordBreak: 'break-word',
          }}>{task.text}</div>

          {(due || task.priority !== 'none') && !task.done && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
              {task.priority !== 'none' && (
                <button onClick={() => cyclePrio(task.id)} title={`Prioridad: ${prio.label}`} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: 0,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 11, color: c.muted, fontFamily: family,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: prio.dot }} />
                  {prio.label}
                </button>
              )}
              {due && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                  fontFamily: "'Geist Mono', monospace", fontSize: 10.5,
                  color: due.overdue ? 'oklch(0.63 0.18 25)' : (due.soon ? c.text : c.muted),
                  fontWeight: due.overdue ? 500 : 400,
                }}>
                  <Icon.cal s={11} c="currentColor" /> {due.label}
                </span>
              )}
            </div>
          )}

          {task.shot && (
            <button onClick={() => setZoom(task.shot)} title="Ver captura" style={{
              display: 'block', marginTop: 7, padding: 0, cursor: 'zoom-in',
              border: `1px solid ${c.border}`, borderRadius: Math.min(radius, 10),
              overflow: 'hidden', background: c.sunk, lineHeight: 0,
              opacity: task.done ? 0.5 : 1,
            }}>
              <img src={task.shot} alt="captura" style={{ display: 'block', width: 104, height: 64, objectFit: 'cover' }} />
            </button>
          )}
        </div>

        {/* delete */}
        <button onClick={() => remove(task.id)} aria-label="borrar" style={{
          flexShrink: 0, width: 24, height: 24, display: 'grid', placeItems: 'center',
          cursor: 'pointer', background: 'none', border: 'none', color: c.faint,
          opacity: hover ? 1 : 0, transition: 'opacity .12s', borderRadius: radius,
        }}>
          <Icon.x s={14} />
        </button>
      </div>
    );
  }

  const optBtn = (active) => ({
    display: 'flex', alignItems: 'center', gap: 5, padding: '5px 9px',
    borderRadius: radius, cursor: 'pointer', fontSize: 11.5, fontWeight: 500,
    fontFamily: family, transition: 'all .12s',
    border: `1px solid ${active ? c.accent : c.border}`,
    background: active ? c.overlay : 'transparent',
    color: active ? c.text : c.muted,
  });

  return (
    <div style={S.popup}>
      {/* header */}
      <div style={S.head}>
        <div>
          <h1 style={S.title}>Tareas</h1>
          <div style={S.count}>
            {pending.length === 0 ? 'todo listo' : `${pending.length} pendiente${pending.length>1?'s':''}`}
          </div>
        </div>
        <button style={S.iconBtn} onClick={() => setTweak('dark', !t.dark)}
          title={t.dark ? 'Modo claro' : 'Modo oscuro'}>
          {t.dark ? <Icon.sun s={16} /> : <Icon.moon s={16} />}
        </button>
      </div>

      {/* category tabs */}
      <div style={S.tabs}>
        <Chip id="todas" label="Todas" />
        {CATS.map(ct => <Chip key={ct.id} id={ct.id} label={ct.label} />)}
      </div>

      {/* list */}
      <div style={S.list}>
        {compose && (
          <div style={{
            border: `1px solid ${c.accent}`, borderRadius: radius + 2, padding: 10,
            margin: '2px 0 8px', background: c.bg,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9,
              fontFamily: "'Geist Mono', monospace", fontSize: 10.5, color: c.muted,
              textTransform: 'uppercase', letterSpacing: '0.07em',
            }}>
              <Icon.cam s={13} c="currentColor" /> Nueva captura
            </div>
            {compose.shot && (
              <img src={compose.shot} alt="captura" style={{
                display: 'block', width: '100%', height: 116, objectFit: 'cover',
                borderRadius: radius, border: `1px solid ${c.border}`, marginBottom: 9,
              }} />
            )}
            <input
              ref={composeRef}
              value={compose.name}
              onChange={e => setCompose({ ...compose, name: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') saveCompose(); if (e.key === 'Escape') setCompose(null); }}
              placeholder="Nombre de la actividad…"
              style={{
                width: '100%', border: `1px solid ${c.border}`, outline: 'none',
                background: c.surface, borderRadius: radius, padding: '9px 11px',
                fontSize: 14, fontFamily: family, color: c.text, marginBottom: 9,
              }} />
            <div style={{ display: 'flex', gap: 7 }}>
              <button onClick={saveCompose} style={{
                flex: 1, padding: '8px', borderRadius: radius, border: 'none', cursor: 'pointer',
                background: c.accent, color: c.onAccent, fontSize: 13, fontWeight: 600, fontFamily: family,
              }}>Guardar tarea</button>
              <button onClick={() => setCompose(null)} style={{
                padding: '8px 14px', borderRadius: radius, cursor: 'pointer',
                border: `1px solid ${c.border}`, background: 'transparent',
                color: c.muted, fontSize: 13, fontWeight: 500, fontFamily: family,
              }}>Cancelar</button>
            </div>
          </div>
        )}

        {pending.length === 0 && doneList.length === 0 && !compose && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', gap: 10, color: c.faint, textAlign: 'center', padding: 24,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 999, border: `1.6px solid ${c.border}`,
              display: 'grid', placeItems: 'center', color: c.faint,
            }}><Icon.check s={20} w={2.4} /></div>
            <div style={{ fontSize: 13.5, color: c.muted }}>Nada por aquí</div>
            <div style={{ fontSize: 12, color: c.faint }}>Agrega tu primera tarea abajo</div>
          </div>
        )}

        {pending.map(task => <Row key={task.id} task={task} />)}

        {doneList.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '14px 8px 6px',
            fontFamily: "'Geist Mono', monospace", fontSize: 10.5, color: c.faint,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Completadas
            <span style={{ flex: 1, height: 1, background: c.border }} />
            {doneList.length}
          </div>
        )}
        {doneList.map(task => <Row key={task.id} task={task} />)}
      </div>

      {/* add */}
      <div style={S.addWrap}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: c.surface, border: `1px solid ${focused ? c.accent : c.border}`,
          borderRadius: radius, padding: '8px', transition: 'border-color .14s',
        }}>
          <button onClick={capture} title="Tarea con captura de pantalla" style={{
            flexShrink: 0, width: 30, height: 30, borderRadius: Math.max(radius-2,4),
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            border: `1px solid ${c.border}`, background: 'transparent', color: c.muted,
          }}>
            <Icon.cam s={16} />
          </button>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            onKeyDown={e => { if (e.key === 'Enter') add(); }}
            placeholder="Agregar tarea…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 14, fontFamily: family, color: c.text, minWidth: 0,
            }} />
          <button onClick={add} disabled={!draft.trim()} style={{
            flexShrink: 0, width: 30, height: 30, borderRadius: Math.max(radius-2,4),
            display: 'grid', placeItems: 'center', cursor: draft.trim() ? 'pointer' : 'default',
            border: 'none', background: draft.trim() ? c.accent : c.sunk,
            color: draft.trim() ? c.onAccent : c.faint, transition: 'all .14s',
          }}>
            <Icon.plus s={17} />
          </button>
        </div>

        {/* options */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap',
          maxHeight: showOpts ? 60 : 0, opacity: showOpts ? 1 : 0,
          overflow: 'hidden', marginTop: showOpts ? 9 : 0,
          transition: 'all .2s ease',
        }}>
          {/* priority cycle */}
          <button style={optBtn(dPrio !== 'none')}
            onClick={() => setDPrio(p => PRIO_CYCLE[(PRIO_CYCLE.indexOf(p)+1)%PRIO_CYCLE.length])}>
            <span style={{
              width: 8, height: 8, borderRadius: 999,
              background: dPrio === 'none' ? 'transparent' : PRIORITIES[dPrio].dot,
              border: dPrio === 'none' ? `1.5px solid ${c.faint}` : 'none',
            }} />
            {dPrio === 'none' ? 'Prioridad' : PRIORITIES[dPrio].label}
          </button>

          {/* category */}
          <button style={optBtn(true)}
            onClick={() => {
              const order = CATS.map(x=>x.id);
              setDCat(p => order[(order.indexOf(p)+1)%order.length]);
            }}>
            {CATS.find(x=>x.id===dCat)?.label}
          </button>

          {/* date */}
          <button style={optBtn(!!dDue)} onClick={() => dateRef.current && dateRef.current.showPicker?.()}>
            <Icon.cal s={13} c="currentColor" />
            {dDue ? fmtDue(dDue).label : 'Fecha'}
            <input ref={dateRef} type="date" value={dDue}
              onChange={e => setDDue(e.target.value)}
              style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />
          </button>
          {dDue && (
            <button onClick={() => setDDue('')} style={{
              ...optBtn(false), padding: '5px 7px', color: c.faint,
            }}><Icon.x s={12} /></button>
          )}
        </div>
      </div>

      {/* lightbox for captured screenshots */}
      {zoom && (
        <div onClick={() => setZoom(null)} style={{
          position: 'absolute', inset: 0, zIndex: 30, cursor: 'zoom-out',
          background: 'rgba(12,12,11,0.72)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22,
        }}>
          <img src={zoom} alt="captura" style={{
            maxWidth: '100%', maxHeight: '100%', borderRadius: radius + 2,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)',
          }} />
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   SCENE — Chrome window with the popup anchored to the toolbar icon
   ========================================================================= */
function FakePage({ dark }) {
  const bar = (w, op) => (
    <div style={{ height: 11, width: w, borderRadius: 6, background: dark ? '#2a2a2c' : '#e9e9e6', opacity: op }} />
  );
  return (
    <div style={{ background: dark ? '#1b1c1e' : '#ffffff', height: '100%', padding: '40px 56px',
      display: 'flex', flexDirection: 'column', gap: 30 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: dark ? '#2a2a2c' : '#eeeeea' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{bar(150,1)}{bar(90,0.7)}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, maxWidth: 520 }}>
        {bar('70%',1)}{bar('92%',0.85)}{bar('84%',0.85)}{bar('60%',0.7)}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ flex: 1, height: 120, borderRadius: 12, background: dark ? '#222325' : '#f3f3ef' }} />
        ))}
      </div>
    </div>
  );
}

function ExtIcon({ c }) {
  // the highlighted extension button in the toolbar (active/clicked state)
  return (
    <div style={{
      position: 'absolute', top: 50, right: 52, width: 30, height: 30, zIndex: 6,
      borderRadius: 8, display: 'grid', placeItems: 'center',
      background: 'rgba(138,180,248,0.22)', boxShadow: '0 0 0 1px rgba(138,180,248,0.4)',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 5, background: c.accent,
        display: 'grid', placeItems: 'center', color: '#fff',
      }}>
        <Icon.check s={12} w={3.2} c="#fff" />
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const { c } = theme(t);

  return (
    <div style={{ position: 'relative', padding: 8 }}>
      <ChromeWindow width={1000} height={660}
        tabs={[{ title: 'Nueva pestaña' }, { title: 'Inbox' }]}
        activeIndex={0} url="search">
        <FakePage dark={false} />
      </ChromeWindow>

      {/* dim the page behind the open popup, like a real focused extension */}
      <div style={{ position: 'absolute', inset: 8, borderRadius: 10, zIndex: 5,
        background: 'rgba(20,20,18,0.10)', pointerEvents: 'none' }} />

      {/* highlighted extension icon */}
      <ExtIcon c={c} />

      {/* little connector arrow */}
      <div style={{
        position: 'absolute', top: 80, right: 60, zIndex: 7,
        width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
        borderBottom: `8px solid ${c.surface}`,
        filter: 'drop-shadow(0 -1px 0 ' + c.border + ')',
      }} />

      {/* the popup */}
      <div style={{ position: 'absolute', top: 88, right: 20, zIndex: 6 }}>
        <Popup t={t} setTweak={setTweak} />
      </div>

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Apariencia" />
        <TweakToggle label="Modo oscuro" value={t.dark} onChange={v => setTweak('dark', v)} />
        <TweakColor label="Acento" value={t.accent}
          options={['#1c1c1a', 'oklch(0.55 0.16 255)', 'oklch(0.55 0.13 160)', 'oklch(0.55 0.18 25)']}
          onChange={v => setTweak('accent', v)} />
        <TweakSection label="Tipografía y forma" />
        <TweakRadio label="Fuente" value={t.font} options={['Geist', 'Sistema', 'Mono']}
          onChange={v => setTweak('font', v)} />
        <TweakRadio label="Esquinas" value={t.radius} options={['recto', 'suave', 'redondo']}
          onChange={v => setTweak('radius', v)} />
        <TweakRadio label="Densidad" value={t.density} options={['compacto', 'normal', 'cómodo']}
          onChange={v => setTweak('density', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
