import React, { useEffect, useState } from 'react';
import axios from 'axios';

const emptyForm = () => ({ level: '', session: '', currency: 'NGN', effectiveFrom: '', notes: '', items: [{ name: '', amount: '' }] });

const FeesCatalogsTab = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // catalog being edited
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [selected, setSelected] = useState(new Set());

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/bursary/fees');
      const data = res.data?.catalogs || res.data?.data || res.data || [];
      setCatalogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load catalogs', err);
      setCatalogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => {
    setForm(emptyForm());
    setEditing(null);
    setShowCreate(true);
  };

  const startEdit = (c) => {
    setEditing(c);
    setForm({
      level: c.level || '',
      session: c.session || '',
      currency: c.currency || 'NGN',
      effectiveFrom: c.effectiveFrom ? new Date(c.effectiveFrom).toISOString().slice(0,10) : '',
      notes: c.notes || '',
      items: Array.isArray(c.items) && c.items.length ? c.items.map(it => ({ name: it.name || '', amount: it.amount ?? '' })) : [{ name: '', amount: '' }]
    });
    setShowCreate(true);
  };

  const updateItem = (idx, key, value) => setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? ({ ...it, [key]: value }) : it) }));
  const addItemRow = () => setForm(f => ({ ...f, items: [...f.items, { name: '', amount: '' }] }));
  const removeItemRow = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const submit = async (e) => {
    e?.preventDefault();
    try {
      const payload = {
        level: form.level,
        session: form.session,
        currency: form.currency,
        effectiveFrom: form.effectiveFrom || null,
        notes: form.notes,
        items: form.items.filter(it => it.name).map(it => ({ name: it.name, amount: Number(String(it.amount).replace(/,/g, '') || 0) }))
      };

      if (editing) {
        await axios.put(`/api/bursary/fees/${editing._id || editing.id}`, payload);
      } else {
        await axios.post('/api/bursary/fees', payload);
      }
      setShowCreate(false);
      setEditing(null);
      await load();
    } catch (err) {
      console.error('Failed to save catalog', err);
      alert('Failed to save catalog');
    }
  };

  const del = async (c) => {
    if (!confirm('Delete this catalog? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/bursary/fees/${c._id || c.id}`);
      await load();
    } catch (err) {
      console.error('Failed to delete', err);
      alert('Failed to delete catalog');
    }
  };

  const acknowledgeOne = async (id) => {
    try {
      await axios.patch(`/api/bursary/fees/${id}/acknowledge`);
      await load();
    } catch (err) {
      console.error('Failed to acknowledge', err);
      alert('Failed to acknowledge');
    }
  };

  const toggleSelect = (id) => setSelected(s => {
    const next = new Set(Array.from(s));
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const bulkAcknowledge = async () => {
    if (!selected.size) return alert('No catalogs selected');
    if (!confirm(`Acknowledge ${selected.size} catalogs?`)) return;
    try {
      await axios.patch('/api/bursary/fees/acknowledge', { ids: Array.from(selected) });
      setSelected(new Set());
      await load();
    } catch (err) {
      console.error('Bulk acknowledge failed', err);
      alert('Bulk acknowledge failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Fees Catalogs</h2>
        <div className="flex items-center gap-2">
          <button onClick={startCreate} className="btn-primary">Create Catalog</button>
          <button onClick={load} className="btn-outline">Refresh</button>
          <button onClick={bulkAcknowledge} className="btn-secondary" disabled={!selected.size}>Acknowledge Selected ({selected.size})</button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={submit} className="p-4 border rounded mb-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input required placeholder="Level (e.g. 100)" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="input" />
            <input required placeholder="Session (e.g. 2024/2025)" value={form.session} onChange={e => setForm(f => ({ ...f, session: e.target.value }))} className="input" />
            <input placeholder="Currency" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="input" />
            <input type="date" placeholder="Effective From" value={form.effectiveFrom} onChange={e => setForm(f => ({ ...f, effectiveFrom: e.target.value }))} className="input" />
            <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input col-span-2" />
          </div>

          <div className="mt-4">
            <label className="font-semibold">Items</label>
            <div className="space-y-2 mt-2">
              {form.items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input className="col-span-6 input" placeholder="Name" value={it.name} onChange={e => updateItem(idx, 'name', e.target.value)} />
                  <input className="col-span-4 input" placeholder="Amount" value={it.amount} onChange={e => updateItem(idx, 'amount', e.target.value)} />
                  <div className="col-span-2">
                    <button type="button" onClick={() => removeItemRow(idx)} className="btn-outline">Remove</button>
                  </div>
                </div>
              ))}
              <div>
                <button type="button" onClick={addItemRow} className="btn-outline">Add item</button>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Create'}</button>
            <button type="button" onClick={() => { setShowCreate(false); setEditing(null); }} className="ml-2 btn-outline">Cancel</button>
          </div>
        </form>
      )}

      <div>
        {loading ? <p>Loading...</p> : (
          catalogs.length ? (
            <div className="grid grid-cols-1 gap-3">
              {catalogs.map(c => {
                const id = c._id || c.id;
                return (
                  <div key={id} className="p-3 border rounded bg-white flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selected.has(id)} onChange={() => toggleSelect(id)} />
                      <div>
                        <div className="font-semibold">Level: {c.level} — Session: {c.session} {c.isNew && <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">NEW</span>}</div>
                        <div className="text-sm text-slate-600">Effective: {c.effectiveFrom ? new Date(c.effectiveFrom).toLocaleDateString() : '—'}</div>
                        <div className="mt-2">
                          {Array.isArray(c.items) && c.items.map((it, i) => (
                            <div key={i} className="text-sm">{it.name} — {it.amount} {c.currency}</div>
                          ))}
                        </div>
                        {c.notes && <div className="mt-2 text-xs text-slate-500">Notes: {c.notes}</div>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {c.isNew && <button onClick={() => acknowledgeOne(id)} className="btn-outline text-sm">Acknowledge</button>}
                        <button onClick={() => startEdit(c)} className="btn-primary text-sm">Edit</button>
                        <button onClick={() => del(c)} className="btn-danger text-sm">Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-slate-600">No catalogs found.</p>
        )}
      </div>
    </div>
  );
};

export default FeesCatalogsTab;
