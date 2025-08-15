(async function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const { apiFetch } = window.__APP__;

  // Tabs
  const tabs = $$('#tabs .tab');
  tabs.forEach(t=>t.addEventListener('click', ()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    $$('.tabpane').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    $('#'+t.dataset.tab).classList.add('active');
  }));

  // Overview
  async function loadOverview(){
    try {
      const s = await apiFetch('/api/admin/summary');
      $('#overview').innerHTML = `<div class="grid3">
        <div class="card"><h3>Users</h3><div class="price">${s.users}</div></div>
        <div class="card"><h3>Items</h3><div class="price">${s.totalSupply}</div></div>
        <div class="card"><h3>Owned</h3><div class="price">${s.owned}</div></div>
      </div>`;
    } catch(e){ $('#overview').textContent = e.message; }
  }

  // Users
  async function renderUsers(){
    try {
      const users = await apiFetch('/api/admin/users');
      const body = $('#usersBody'); body.innerHTML='';
      users.forEach(u=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.balance} TON</td><td>${u.gifts}</td><td>${u.banned? 'yes':'no'}</td>`;
        body.appendChild(tr);
      });
    } catch(e){ console.error(e); }
  }
  $('#createUserBtn').addEventListener('click', async ()=>{
    try {
      const name = $('#newUserName').value.trim();
      const email = $('#newUserEmail').value.trim();
      const pass = $('#newUserPass').value;
      const res = await apiFetch('/api/admin/users/create', { method:'POST', body: JSON.stringify({ name, email, password: pass, balance: 1000 }) });
      pushToast('User '+res.user.id+' created');
      renderUsers(); loadOverview();
    } catch(e){ pushToast(e.message); }
  });
  $('#balApplyBtn').addEventListener('click', async ()=>{
    try {
      const userId = $('#balUserId').value.trim();
      const delta = Number($('#balDelta').value);
      const res = await apiFetch('/api/admin/users/balance', { method:'POST', body: JSON.stringify({ userId, delta }) });
      pushToast('New balance: '+res.balance);
      renderUsers();
    } catch(e){ pushToast(e.message); }
  });
  $('#banApplyBtn').addEventListener('click', async ()=>{
    try {
      const userId = $('#banUserId').value.trim();
      const banned = $('#banState').value === 'true';
      await apiFetch('/api/admin/users/ban', { method:'POST', body: JSON.stringify({ userId, banned }) });
      pushToast('Ban updated');
      renderUsers();
    } catch(e){ pushToast(e.message); }
  });

  // Items
  async function renderItems(){
    try {
      const items = await apiFetch('/api/market/items');
      const body = $('#itemsBody'); body.innerHTML='';
      items.forEach(it=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${it.id}</td><td>${it.name}</td><td>${it.price}</td><td>${it.ownerId||''}</td><td>${it.collection}</td><td>${it.rating}</td>`;
        body.appendChild(tr);
      });
    } catch(e){ console.error(e); }
  }
  $('#createItemBtn').addEventListener('click', async ()=>{
    try {
      const name = $('#itemName').value.trim();
      const price = Number($('#itemPrice').value);
      const img = $('#itemImg').value.trim();
      const collection = $('#itemCollection').value.trim() || 'Default';
      const res = await apiFetch('/api/admin/items/create', { method:'POST', body: JSON.stringify({ name, price, img, collection }) });
      pushToast('Item '+res.item.id+' created');
      renderItems(); loadOverview();
    } catch(e){ pushToast(e.message); }
  });
  $('#updApplyBtn').addEventListener('click', async ()=>{
    try {
      const id = $('#updItemId').value.trim();
      const price = Number($('#updPrice').value);
      await apiFetch('/api/admin/items/update', { method:'POST', body: JSON.stringify({ id, price }) });
      pushToast('Item updated');
      renderItems();
    } catch(e){ pushToast(e.message); }
  });
  $('#delApplyBtn').addEventListener('click', async ()=>{
    try {
      const id = $('#delItemId').value.trim();
      await apiFetch('/api/admin/items/delete', { method:'POST', body: JSON.stringify({ id }) });
      pushToast('Item deleted');
      renderItems(); loadOverview();
    } catch(e){ pushToast(e.message); }
  });
  $('#clearItemsBtn').addEventListener('click', async ()=>{
    try {
      await apiFetch('/api/admin/items/clear', { method:'POST' });
      pushToast('Market cleared');
      renderItems(); loadOverview();
    } catch(e){ pushToast(e.message); }
  });

  // Operations
  $('#giftSendBtn').addEventListener('click', async ()=>{
    try {
      const toUserId = $('#giftUserId').value.trim();
      const itemId = $('#giftItemId').value.trim();
      const res = await apiFetch('/api/admin/gift', { method:'POST', body: JSON.stringify({ toUserId, itemId }) });
      pushToast(res.message || 'Gift sent');
      renderItems(); renderUsers(); loadOverview();
    } catch(e){ pushToast(e.message); }
  });
  $('#trApplyBtn').addEventListener('click', async ()=>{
    try {
      const itemId = $('#trItemId').value.trim();
      const toUserId = $('#trToUserId').value.trim();
      await apiFetch('/api/admin/transfer', { method:'POST', body: JSON.stringify({ itemId, toUserId }) });
      pushToast('Transfer ok');
      renderItems(); renderUsers(); loadOverview();
    } catch(e){ pushToast(e.message); }
  });
  $('#burnApplyBtn').addEventListener('click', async ()=>{
    try {
      const itemId = $('#burnItemId').value.trim();
      await apiFetch('/api/admin/burn', { method:'POST', body: JSON.stringify({ itemId }) });
      pushToast('Burned');
      renderItems(); loadOverview();
    } catch(e){ pushToast(e.message); }
  });

  // History
  async function loadHistory(){
    try {
      const userId = $('#histUserId').value.trim();
      const q = userId ? ('?userId='+encodeURIComponent(userId)) : '';
      const list = await apiFetch('/api/admin/history'+q);
      const ul = $('#historyList'); ul.innerHTML='';
      list.forEach(h=>{
        const li = document.createElement('li');
        const d = new Date(h.ts||Date.now());
        li.textContent = `[${d.toLocaleString()}] ` + h.t + (h.userId? (' — '+h.userId):'');
        ul.appendChild(li);
      });
    } catch(e){ pushToast(e.message); }
  }
  $('#histLoadBtn').addEventListener('click', loadHistory);

  // Database
  $('#dbExportBtn').addEventListener('click', async ()=>{
    try {
      const db = await apiFetch('/api/admin/db/export');
      const blob = new Blob([JSON.stringify(db, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'db-export.json';
      a.click();
    } catch(e){ pushToast(e.message); }
  });
  $('#dbImportBtn').addEventListener('click', async ()=>{
    try {
      const text = $('#dbImportText').value;
      const db = JSON.parse(text);
      await apiFetch('/api/admin/db/import', { method:'POST', body: JSON.stringify({ db }) });
      pushToast('DB imported');
      renderUsers(); renderItems(); loadOverview(); loadHistory();
    } catch(e){ pushToast(e.message); }
  });

  // Initial loads
  loadOverview(); renderUsers(); renderItems(); loadHistory();
})();


// --- Payments moderation ---
(function(){
  const $ = (s,r=document)=>r.querySelector(s);
  const { apiFetch } = window.__APP__;

  async function loadPays(){
    try{
      const status = $('#payFilter').value || '';
      const q = status ? ('?status='+encodeURIComponent(status)) : '';
      const list = await apiFetch('/api/admin/payments'+q);
      const body = $('#payBodyAdmin'); body.innerHTML='';
      list.forEach(p=>{
        const tr = document.createElement('tr');
        const d = new Date(p.ts);
        tr.innerHTML = `<td>${p.id}</td><td>${p.userId}</td><td>${p.kind}</td><td>${p.amountTon}</td><td>$${p.usd}</td><td>${p.tonAddress||''}</td><td>${p.status}</td>
        <td>${p.status==='pending'?'<button class="btn" data-act="approve" data-id="'+p.id+'">Approve</button> <button class="btn btn-ghost" data-act="reject" data-id="'+p.id+'">Reject</button>':''}</td>
        <td>${d.toLocaleString()}</td>`;
        body.appendChild(tr);
      });
    }catch(e){ pushToast(e.message); }
  }
  document.addEventListener('click', async (e)=>{
    const act = e.target?.dataset?.act;
    const id = e.target?.dataset?.id;
    if (!act || !id) return;
    if (act==='approve'){
      try{ await apiFetch('/api/admin/payments/approve', { method:'POST', body: JSON.stringify({ id }) }); pushToast('Approved'); loadPays(); }catch(e){ pushToast(e.message); }
    } else if (act==='reject'){
      try{
        const note = prompt('Reason?') || '';
        await apiFetch('/api/admin/payments/reject', { method:'POST', body: JSON.stringify({ id, note }) });
        pushToast('Rejected'); loadPays();
      }catch(e){ pushToast(e.message); }
    }
  });
  $('#payReloadBtn').addEventListener('click', loadPays);
  $('#payFilter').addEventListener('change', loadPays);

  // live updates
  const socket = window.io ? io() : null;
  if (socket){
    socket.on('admin:payments:update', loadPays);
  }

  // Auto init when payments tab visible
  const tabs = Array.from(document.querySelectorAll('#tabs .tab'));
  tabs.forEach(t=>t.addEventListener('click', ()=>{
    if (t.dataset.tab==='payments') loadPays();
  }));
})();