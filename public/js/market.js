(async function(){
  const grid = document.getElementById('grid');
  const search = document.getElementById('search');
  const sort = document.getElementById('sort');
  const { apiFetch } = window.__APP__;

  async function getItems(){ return await apiFetch('/api/market/items'); }

  function card(item){
    const ownedBadge = item.ownerId ? `<span class="badge">Owned</span>` : '';
    const el = document.createElement('div');
    el.className = 'item-card';
    el.innerHTML = `
      <img src="${item.img}" alt="${item.name}"/>
      <div class="body">
        <div class="row"><strong>${item.name}</strong><span class="badge">${item.collection}</span></div>
        <div class="row"><span class="price">${item.price} TON</span><span class="badge">★ ${item.rating}</span></div>
        <div class="row gap">
          <button class="btn buy" data-id="${item.id}" ${item.ownerId?'disabled':''}>Buy</button>
          <button class="btn btn-ghost gift" data-id="${item.id}" ${item.ownerId?'disabled':''}>Gift</button>
          <button class="btn btn-ghost upgrade" data-id="${item.id}" ${item.ownerId? '' : 'disabled'}>Upgrade</button>
        </div>
      </div>`;
    return el;
  }

  async function render(){
    const q = (search.value||'').toLowerCase();
    const s = sort.value;
    let items = await getItems();
    if (q) items = items.filter(x=>x.name.toLowerCase().includes(q));
    if (s==='price-asc') items.sort((a,b)=>a.price-b.price);
    if (s==='price-desc') items.sort((a,b)=>b.price-a.price);
    if (s==='rating-desc') items.sort((a,b)=>b.rating-a.rating);
    if (s==='new') items.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
    grid.innerHTML = '';
    items.forEach(x=>grid.appendChild(card(x)));
  }
  window.renderMarket = render;

  async function buyOrGift(itemId, mode){
    try {
      let toUserId = null;
      if (mode==='gift') {
        toUserId = prompt('Enter recipient User ID:');
        if (!toUserId) return;
      }
      const res = await apiFetch('/api/tx/pay', {
        method:'POST',
        body: JSON.stringify({ itemId, mode, toUserId })
      });
      pushToast(res.message || 'OK');
      render();
    } catch(e){ pushToast(e.message); }
  }

  async function upgrade(itemId){
    try {
      const res = await apiFetch('/api/nft/upgrade', { method:'POST', body: JSON.stringify({ id:itemId }) });
      pushToast(res.message || 'Upgraded');
      render();
    } catch(e){ pushToast(e.message); }
  }

  grid.addEventListener('click', (e)=>{
    const id = e.target?.dataset?.id;
    if (!id) return;
    if (e.target.classList.contains('buy')) buyOrGift(id,'buy');
    if (e.target.classList.contains('gift')) buyOrGift(id,'gift');
    if (e.target.classList.contains('upgrade')) upgrade(id);
  });

  search.addEventListener('input', render);
  sort.addEventListener('change', render);
  render();
})();
