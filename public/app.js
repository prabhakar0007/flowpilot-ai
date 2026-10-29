const $ = id => document.getElementById(id);
let invoices = [];
let history = [];

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function formatReply(txt = '') {
  let h = esc(txt);
  h = h.replace(/^### (.*$)/gim, '<strong style="display:block;margin:6px 0 3px;color:#b6a2ff;font-size:1.05em">$1</strong>');
  h = h.replace(/^#### (.*$)/gim, '<strong style="display:block;margin:4px 0 2px;color:#77d8ff">$1</strong>');
  h = h.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*(.*?)\*/g, '<em>$1</em>');
  h = h.replace(/^> (.*$)/gim, '<div style="border-left:3px solid #8075ff;margin:6px 0;padding:4px 10px;color:#c2cbdf;background:#17203b88;border-radius:4px">$1</div>');
  h = h.replace(/\n/g, '<br>');
  return h;
}

function money(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(Number(n || 0));
}

function go(p) {
  document.querySelectorAll('.page').forEach(x => x.classList.add('hidden'));
  const target = $(p);
  if (target) target.classList.remove('hidden');
  const titles = {
    dashboard: 'Dashboard',
    assistant: 'AI Assistant',
    invoices: 'Invoices',
    history: 'Chat history'
  };
  $('title').textContent = titles[p] || 'Dashboard';
  document.querySelectorAll('[data-page]').forEach(b => {
    b.classList.toggle('active', b.dataset.page === p);
  });
}

function loadData() {
  const savedInvoices = localStorage.getItem('fp_invoices');
  if (savedInvoices !== null) {
    try {
      invoices = JSON.parse(savedInvoices) || [];
    } catch (e) {
      invoices = [];
    }
  } else {
    // Initial sample data so the dashboard is immediately informative
    invoices = [
      {
        id: 'inv_demo_1',
        invoice_number: 'FP-83920194',
        client_name: 'Acme Studio',
        client_email: 'hello@acmestudio.io',
        description: 'UI/UX Design Sprint & Brand Guidelines',
        amount: 35000,
        due_date: '2026-11-15',
        status: 'Sent',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'inv_demo_2',
        invoice_number: 'FP-83920195',
        client_name: 'Nexus Tech',
        client_email: 'billing@nexustech.dev',
        description: 'API Integration & Workflow Automation',
        amount: 52000,
        due_date: '2026-11-01',
        status: 'Paid',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ];
    saveInvoices();
  }

  const savedHistory = localStorage.getItem('fp_history');
  if (savedHistory !== null) {
    try {
      history = JSON.parse(savedHistory) || [];
    } catch (e) {
      history = [];
    }
  } else {
    history = [];
  }

  render();
}

function saveInvoices() {
  localStorage.setItem('fp_invoices', JSON.stringify(invoices));
  render();
}

function saveHistory() {
  localStorage.setItem('fp_history', JSON.stringify(history));
  render();
}

function render() {
  $('invoiceCount').textContent = invoices.length;
  $('invoiceValue').textContent = money(invoices.reduce((s, x) => s + Number(x.amount || 0), 0));
  $('chatCount').textContent = history.length;
  $('paidCount').textContent = invoices.filter(x => x.status === 'Paid').length;

  const card = x => `
    <div class="invoice">
      <b>${esc(x.invoice_number)}</b> · ${esc(x.client_name)} <strong style="float:right">${money(x.amount)}</strong>
      <small>${esc(x.description)} · Due ${esc(x.due_date || '—')} · ${esc(x.status)}</small>
      <div class="invoice-actions">
        <button data-status="${x.id}">Change status</button>
        <button data-del="${x.id}">Delete</button>
      </div>
    </div>
  `;

  $('recent').innerHTML = invoices.slice(0, 4).map(card).join('') || 'No invoices yet.';
  $('invoiceList').innerHTML = invoices.map(card).join('') || 'No invoices yet. Click New invoice.';
  $('historyList').innerHTML = history.map(x => `
    <div class="invoice">
      <b>${esc(x.prompt)}</b>
      <small>${new Date(x.created_at).toLocaleString()}</small>
      <div style="margin-top:6px;line-height:1.6">${formatReply(x.reply)}</div>
      <button data-hdel="${x.id}">Delete conversation</button>
    </div>
  `).join('') || 'No saved conversations yet.';
}

// Navigation
document.querySelectorAll('[data-page]').forEach(b => {
  b.onclick = () => go(b.dataset.page);
});
document.querySelectorAll('[data-goto]').forEach(b => {
  b.onclick = () => go(b.dataset.goto);
});
$('showInvoice').onclick = () => $('invoiceFormWrap').classList.toggle('hidden');
$('refresh').onclick = loadData;

// AI Assistant Chat
$('chatForm').onsubmit = async e => {
  e.preventDefault();
  const prompt = $('prompt').value.trim();
  if (!prompt) return;
  $('prompt').value = '';

  const add = (role, text) => {
    const d = document.createElement('div');
    d.className = 'bubble ' + role;
    d.textContent = text;
    $('messages').append(d);
    $('messages').scrollTop = $('messages').scrollHeight;
    return d;
  };

  add('user', prompt);
  const pending = add('ai', 'Thinking…');

  try {
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'AI request failed');
    pending.innerHTML = formatReply(data.reply);

    const chatItem = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      prompt,
      reply: data.reply,
      created_at: new Date().toISOString()
    };
    history.unshift(chatItem);
    saveHistory();
  } catch (err) {
    pending.textContent = err.message;
  }
};

// Create Invoice
$('invoiceForm').onsubmit = e => {
  e.preventDefault();
  const row = {
    id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    invoice_number: 'FP-' + Date.now().toString().slice(-8),
    client_name: $('client').value.trim(),
    client_email: $('clientEmail').value.trim(),
    description: $('description').value.trim(),
    amount: Number($('amount').value),
    due_date: $('dueDate').value || null,
    status: $('status').value,
    created_at: new Date().toISOString()
  };
  invoices.unshift(row);
  saveInvoices();
  e.target.reset();
  $('invoiceFormWrap').classList.add('hidden');
};

// Invoice status, delete & chat delete actions
document.addEventListener('click', e => {
  const s = e.target.closest('[data-status]');
  const d = e.target.closest('[data-del]');
  const h = e.target.closest('[data-hdel]');

  if (s) {
    const x = invoices.find(i => i.id === s.dataset.status);
    const states = ['Draft', 'Sent', 'Paid', 'Overdue'];
    if (!x) return;
    x.status = states[(states.indexOf(x.status) + 1) % states.length];
    saveInvoices();
  }

  if (d) {
    if (!confirm('Delete this invoice?')) return;
    invoices = invoices.filter(i => i.id !== d.dataset.del);
    saveInvoices();
  }

  if (h) {
    if (!confirm('Delete this conversation?')) return;
    history = history.filter(i => i.id !== h.dataset.hdel);
    saveHistory();
  }
});

// Initialize on load
go('dashboard');
loadData();
