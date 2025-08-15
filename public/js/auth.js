(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const tabs = $$('.tab');
  const panes = $$('.tabpane');
  tabs.forEach(t=>t.addEventListener('click', ()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    panes.forEach(x=>x.classList.remove('active'));
    t.classList.add('active'); $('#'+t.dataset.tab).classList.add('active');
  }));

  const { apiFetch, setToken, setMe, updateAuthUI } = window.__APP__;
  $('#doLogin').addEventListener('click', async ()=>{
    const email = $('#loginEmail').value.trim();
    const password = $('#loginPass').value;
    const res = await apiFetch('/api/auth/login', { method:'POST', body: JSON.stringify({ email, password }) });
    setToken(res.token); setMe(res.user); updateAuthUI(); location.href='/market.html';
  });

  $('#doRegister').addEventListener('click', async ()=>{
    const name = $('#regName').value.trim();
    const email = $('#regEmail').value.trim();
    const password = $('#regPass').value;
    const res = await apiFetch('/api/auth/register', { method:'POST', body: JSON.stringify({ name, email, password }) });
    setToken(res.token); setMe(res.user); updateAuthUI(); location.href='/market.html';
  });
})();
