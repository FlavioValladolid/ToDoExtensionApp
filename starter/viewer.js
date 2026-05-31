async function load() {
  if (!window.chrome?.storage?.local) return;
  const r = await chrome.storage.local.get('todo_preview_img');
  if (r.todo_preview_img) {
    document.getElementById('img').src = r.todo_preview_img;
    chrome.storage.local.remove('todo_preview_img');
  }
}
load();
document.getElementById('close').onclick = () => window.close();
document.addEventListener('keydown', e => { if (e.key === 'Escape') window.close(); });
