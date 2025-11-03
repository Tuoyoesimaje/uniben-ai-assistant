import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FeesCatalogsTab = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ level: '', session: '', currency: 'NGN', effectiveFrom: '', notes: '', itemsText: '' });

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/bursary/fees');
      if (res.data?.success) setCatalogs(res.data.catalogs || res.data.data || []);
      else setCatalogs(res.data || []);
    } catch (err) {
      console.error('Failed to load catalogs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      const items = form.itemsText.split('\n').map(line => {
        const [name, amount] = line.split(':').map(s => s && s.trim());
        return name ? { name, amount: Number((amount || '0').replace(/,/g, '')) } : null;
      }).filter(Boolean);
      const payload = { ...form, items };
      const res = await axios.post('/api/bursary/fees', payload);
      if (res.data?.success) {
        setShowCreate(false);
        setForm({ level: '', session: '', currency: 'NGN', effectiveFrom: '', notes: '', itemsText: '' });
        await load();
      } else {
        alert('Failed to create catalog');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating catalog');
    }
  };

  const acknowledge = async (id) => {
    try {
      await axios.patch(`/api/bursary/fees/${id}/acknowledge`);
      await load();
    } catch (err) {
      console.error('Failed to acknowledge', err);
      alert('Failed to acknowledge');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Fees Catalogs</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreate(s => !s)} className="btn-primary">{showCreate ? 'Cancel' : 'Create Catalog'}</button>
          <button onClick={load} className="btn-outline">Refresh</button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={create} className="p-4 border rounded mb-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input required placeholder="Level (e.g. 100)" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="input" />
            <input required placeholder="Session (e.g. 2024/2025)" value={form.session} onChange={e => setForm(f => ({ ...f, session: e.target.value }))} className="input" />
            <input placeholder="Currency" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="input" />
            <input type="date" placeholder="Effective From" value={form.effectiveFrom} onChange={e => setForm(f => ({ ...f, effectiveFrom: e.target.value }))} className="input" />
            <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input col-span-2" />
            <textarea placeholder="Items (one per line, format: name:amount)" value={form.itemsText} onChange={e => setForm(f => ({ ...f, itemsText: e.target.value }))} className="input col-span-3 h-28" />
          </div>
          <div className="mt-3">
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      )}

      <div>
        {loading ? <p>Loading...</p> : (
          catalogs.length ? (
            <div className="grid grid-cols-1 gap-3">
              {catalogs.map(c => (
                <div key={c._id || c.id} className="p-3 border rounded bg-white flex justify-between items-start">
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
                  <div className="flex flex-col gap-2">
                    {c.isNew && <button onClick={() => acknowledge(c._id || c.id)} className="btn-outline text-sm">Acknowledge</button>}
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-600">No catalogs found.</p>
        )}
      </div>
    </div>
  );
};

export default FeesCatalogsTab;
