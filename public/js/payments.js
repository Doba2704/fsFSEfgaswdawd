(async function(){
  const $ = (s,r=document)=>r.querySelector(s);
  const { apiFetch } = window.__APP__;
  let rate = { tonUsd: 3.5 };
  try { rate = await apiFetch('/api/rate'); } catch{}
  $('#rate').textContent = '1 TON'; $('#rateUsd').textContent = rate.tonUsd.toFixed(2);

  async function loadMe(){
    try {
      const me = await apiFetch('/api/me');
      $('#balanceTon').textContent = (me.balance||0) + ' TON';
      $('#balanceUsd').textContent = ((me.balance||0)*rate.tonUsd).toFixed(2);
    } catch(e){}
  }
  async function loadPayments(){
    try {
      const list = await apiFetch('/api/payments/mine');
      const body = $('#payBody'); body.innerHTML='';
      list.forEach(p=>{
        const tr = document.createElement('tr');
        const d = new Date(p.ts);
        tr.innerHTML = `<td>${p.id}</td><td>${p.kind}</td><td>${p.amountTon}</td><td>$${p.usd}</td><td>${p.status}</td><td>${d.toLocaleString()}</td>`;
        body.appendChild(tr);
      });
    } catch(e){}
  }

  function syncUsdInputs(){
    const dep = Number($('#depAmt').value) || 0;
    $('#depUsd').textContent = (dep*rate.tonUsd).toFixed(2);
    const wd = Number($('#wdAmt').value) || 0;
    $('#wdUsd').textContent = (wd*rate.tonUsd).toFixed(2);
  }
  $('#depAmt').addEventListener('input', syncUsdInputs);
  $('#wdAmt').addEventListener('input', syncUsdInputs);
  syncUsdInputs();

  $('#depBtn').addEventListener('click', async ()=>{
    try {
      const amountTon = Number($('#depAmt').value);
      const res = await apiFetch('/api/payments/deposit/request', { method:'POST', body: JSON.stringify({ amountTon }) });
      pushToast('Deposit requested: '+amountTon+' TON');
      loadPayments();
    } catch(e){ pushToast(e.message); }
  });
  $('#wdBtn').addEventListener('click', async ()=>{
    try {
      const amountTon = Number($('#wdAmt').value);
      const tonAddress = $('#wdAddr').value.trim();
      const res = await apiFetch('/api/payments/withdraw/request', { method:'POST', body: JSON.stringify({ amountTon, tonAddress }) });
      pushToast('Withdraw requested: '+amountTon+' TON');
      loadPayments(); loadMe();
    } catch(e){ pushToast(e.message); }
  });

  // Notifications bell
  const socket = window.io ? io() : null;
  let sid = null;
  if (socket){
    socket.on('hello', (d)=>{ sid = d.sid; attachSocket(); });
    socket.on('notify', (n)=>{ pushToast('Notification: '+n.type); if (location.pathname.endsWith('/payments.html')) { loadPayments(); loadMe(); } });
  }
  async function attachSocket(){
    try { await apiFetch('/api/attach-socket', { method:'POST', headers:{ 'X-SID': sid } }); } catch(e){}
  }

  loadMe(); loadPayments();
})();
