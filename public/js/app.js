// Helpers & state
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const pushToast = (msg) => { const d=document.createElement('div'); d.className='toast'; d.textContent=msg; document.body.appendChild(d); setTimeout(()=>d.remove(), 2800); };

const socket = window.io ? io() : null;
if (socket) {
  socket.on('connect', ()=>console.log('socket connected'));
  socket.on('market:update', ()=>{
    if (window.renderMarket) window.renderMarket();
    if (window.renderProfile) window.renderProfile();
  });
}

const TOKEN_KEY = 'token';
const ME_KEY = 'me';
let TOKEN = localStorage.getItem(TOKEN_KEY) || '';
let ME = JSON.parse(localStorage.getItem(ME_KEY) || 'null');
function setToken(t){ TOKEN=t||''; if (t) localStorage.setItem(TOKEN_KEY,t); else localStorage.removeItem(TOKEN_KEY); }
function setMe(m){ ME=m||null; if (m) localStorage.setItem(ME_KEY, JSON.stringify(m)); else localStorage.removeItem(ME_KEY); }

function updateAuthUI(){
  const meBadge = $('#meBadge'), loginBtn = $('#loginBtn'), logoutBtn = $('#logoutBtn');
  if (!meBadge) return;
  if (ME) {
    meBadge.classList.remove('hidden'); meBadge.textContent = ME.name + ' (' + ME.id + ')';
    if (loginBtn) loginBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
  } else {
    meBadge.classList.add('hidden');
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
  }
}
document.addEventListener('click', (e)=>{
  if (e.target.id === 'logoutBtn') { setToken(''); setMe(null); updateAuthUI(); pushToast('Signed out'); }
});
updateAuthUI();

async function apiFetch(path, opts={}){
  const url = (window.API_ORIGIN || location.origin) + path;
  const headers = Object.assign({'Content-Type':'application/json'}, opts.headers || {});
  if (TOKEN) headers['Authorization'] = 'Bearer '+TOKEN;
  const res = await fetch(url, {...opts, headers});
  if (res.ok) return await res.json();
  const t = await res.text(); throw new Error('API '+res.status+': '+t);
}
window.__APP__ = { apiFetch, setToken, setMe, updateAuthUI };
