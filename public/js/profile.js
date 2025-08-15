(async function(){
  const info = document.getElementById('profileInfo');
  const owned = document.getElementById('owned');
  const history = document.getElementById('history');
  const { apiFetch } = window.__APP__;

  async function getMe(){ return await apiFetch('/api/me'); }
  async function getOwned(){ return await apiFetch('/api/me/owned'); }
  async function getHistory(){ return await apiFetch('/api/me/history'); }

  async function render(){
    const me = await getMe();
    info.innerHTML = `<div class="row between"><div>
      <h2>${me.name}</h2><div class="muted">ID: ${me.id}</div></div>
      <div class="price">${me.balance} TON</div></div>`;

    const items = await getOwned();
    owned.innerHTML = '';
    items.forEach(item=>{
      const el = document.createElement('div');
      el.className = 'item-card';
      el.innerHTML = `
        <img src="${item.img}" alt="${item.name}"/>
        <div class="body">
          <div class="row"><strong>${item.name}</strong><span class="badge">ID: ${item.id}</span></div>
          <div class="row"><span class="price">${item.price} TON</span><span class="badge">${item.collection}</span></div>
          <button class="btn btn-ghost" data-id="${item.id}">Transfer (soon)</button>
        </div>`;
      owned.appendChild(el);
    });

    const hist = await getHistory();
    history.innerHTML = '';
    hist.forEach(x=>{
      const li = document.createElement('li'); li.textContent = x.t; history.appendChild(li);
    });
  }
  window.renderProfile = render;
  render();
})();
