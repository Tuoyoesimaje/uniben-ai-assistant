import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const emptyForm = () => ({ level: '', session: '', currency: 'NGN', effectiveFrom: '', notes: '', items: [{ name: '', amount: '' }] });

const FeesCatalogsTab = ({ user: userProp = null }) => {
  const { user: authUser, hasRole } = useAuth();
  const user = userProp || authUser;
  const isBursaryAdmin = hasRole ? hasRole('bursary_admin') : (user && user.role === 'bursary_admin');

  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // catalog being edited
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
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

  const validateForm = () => {
    const err = {};
    if (!form.level) err.level = 'Level is required';
    if (!form.session) err.session = 'Session is required';
    if (!form.effectiveFrom) err.effectiveFrom = 'Effective date is required';
    const itemErrors = form.items.map((it) => {
      const ie = {};
      if (!it.name) ie.name = 'Name required';
      if (it.amount === '' || it.amount === null || isNaN(Number(it.amount))) ie.amount = 'Valid amount required';
      return ie;
    });
    if (!form.items.length) err.items = 'Add at least one item';
    else if (itemErrors.some(e => Object.keys(e).length)) err.itemErrors = itemErrors;
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const totalAmount = () => {
    return form.items.reduce((s, it) => s + (Number(String(it.amount).replace(/,/g, '')) || 0), 0);
  };

  const submit = async (e) => {
    e?.preventDefault();
    try {
      // basic client-side validation
      if (!form.level || !form.session || !form.effectiveFrom) return alert('Level, session and effective date are required');
      if (!form.items || !form.items.some(it => it.name && it.amount)) return alert('Add at least one item with name and amount');

      const payload = {
        level: form.level,
        session: form.session,
        currency: form.currency,
        effectiveFrom: form.effectiveFrom || null,
        notes: form.notes,
        items: form.items.filter(it => it.name && it.amount !== '' && !isNaN(Number(String(it.amount).replace(/,/g, '')))).map(it => ({ name: it.name, amount: Number(String(it.amount).replace(/,/g, '') || 0) }))
      };
      if (!isBursaryAdmin) return alert('You do not have permission to perform this action');

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
          {isBursaryAdmin && <button onClick={startCreate} className="btn-primary">Create Catalog</button>}
          <button onClick={load} className="btn-outline">Refresh</button>
          {isBursaryAdmin && <button onClick={bulkAcknowledge} className="btn-secondary" disabled={!selected.size}>Acknowledge Selected ({selected.size})</button>}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowCreate(false); setEditing(null); }} />
          <form onSubmit={submit} className="relative z-10 w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editing ? 'Edit Fees Catalog' : 'Create Fees Catalog'}</h3>
              <div className="flex items-center gap-2">
                <div className="text-sm text-slate-500">Total: <span className="font-medium">{form.currency} {totalAmount().toLocaleString()}</span></div>
                <button type="button" onClick={() => { setShowCreate(false); setEditing(null); setErrors({}); }} className="text-slate-500 hover:text-slate-800">✕</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <input disabled={!isBursaryAdmin} required placeholder="Level (e.g. 100)" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="input" />
                {errors.level && <div className="text-red-500 text-sm mt-1">{errors.level}</div>}
              </div>
              <div>
                <input disabled={!isBursaryAdmin} required placeholder="Session (e.g. 2024/2025)" value={form.session} onChange={e => setForm(f => ({ ...f, session: e.target.value }))} className="input" />
                {errors.session && <div className="text-red-500 text-sm mt-1">{errors.session}</div>}
              </div>
              <div>
                <input disabled={!isBursaryAdmin} placeholder="Currency" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="input" />
              </div>
              <div className="md:col-span-1">
                <label className="text-sm text-slate-600">Effective From</label>
                <input disabled={!isBursaryAdmin} type="date" placeholder="Effective From" value={form.effectiveFrom} onChange={e => setForm(f => ({ ...f, effectiveFrom: e.target.value }))} className="input" />
                {errors.effectiveFrom && <div className="text-red-500 text-sm mt-1">{errors.effectiveFrom}</div>}
              </div>
              <div className="md:col-span-2">
                <input disabled={!isBursaryAdmin} placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input" />
              </div>
            </div>

            <div className="mt-4">
              <label className="font-semibold">Items</label>
              <div className="space-y-3 mt-3">
                {form.items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <input disabled={!isBursaryAdmin} className="input" placeholder="Name" value={it.name} onChange={e => updateItem(idx, 'name', e.target.value)} />
                      {errors.itemErrors && errors.itemErrors[idx] && errors.itemErrors[idx].name && <div className="text-red-500 text-sm mt-1">{errors.itemErrors[idx].name}</div>}
                    </div>
                    <div className="col-span-4">
                      <input disabled={!isBursaryAdmin} type="number" step="0.01" className="input" placeholder="Amount" value={it.amount} onChange={e => updateItem(idx, 'amount', e.target.value)} />
                      {errors.itemErrors && errors.itemErrors[idx] && errors.itemErrors[idx].amount && <div className="text-red-500 text-sm mt-1">{errors.itemErrors[idx].amount}</div>}
                    </div>
                    <div className="col-span-2 flex gap-2">
                      {isBursaryAdmin ? (
                        <button type="button" onClick={() => removeItemRow(idx)} className="btn-outline">Remove</button>
                      ) : (
                        <div className="text-sm text-slate-500">&nbsp;</div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-3">
                  {isBursaryAdmin && <button type="button" onClick={addItemRow} className="btn-outline">+ Add item</button>}
                  {errors.items && <div className="text-red-500 text-sm">{errors.items}</div>}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                {errors.form && <div className="text-red-500 text-sm mb-2">{errors.form}</div>}
                {!isBursaryAdmin && <div className="text-sm text-slate-500">You do not have permission to create or edit catalogs.</div>}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setShowCreate(false); setEditing(null); setErrors({}); }} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary" disabled={!isBursaryAdmin}>{editing ? 'Save changes' : 'Create catalog'}</button>
              </div>
            </div>
          </form>
        </div>
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
                        {c.isNew && isBursaryAdmin && <button onClick={() => acknowledgeOne(id)} className="btn-outline text-sm">Acknowledge</button>}
                        {isBursaryAdmin ? (
                          <>
                            <button onClick={() => startEdit(c)} className="btn-primary text-sm">Edit</button>
                            <button onClick={() => del(c)} className="btn-danger text-sm">Delete</button>
                          </>
                        ) : (
                          <button onClick={() => startEdit(c)} className="btn-outline text-sm">View</button>
                        )}
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
