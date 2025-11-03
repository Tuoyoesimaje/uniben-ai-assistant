import React, { useState } from 'react';
import axios from 'axios';

const FeesPage = () => {
  const [level, setLevel] = useState('');
  const [session, setSession] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const find = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      const res = await axios.get('/api/bursary/fees/find', { params: { level, session } });
      setResult(res.data?.catalog || res.data);
    } catch (err) {
      console.error(err);
      setResult({ error: 'Failed to fetch' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8">
      <div className="container mx-auto max-w-3xl p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow p-6 border">
          <h1 className="text-2xl font-bold mb-2">Fees Lookup</h1>
          <p className="text-sm text-slate-600 mb-4">Search the official fees catalog by level and session.</p>

          <form onSubmit={find} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input placeholder="Level (e.g. 100)" value={level} onChange={e => setLevel(e.target.value)} className="input" />
            <input placeholder="Session (e.g. 2024/2025)" value={session} onChange={e => setSession(e.target.value)} className="input" />
            <div className="flex gap-2">
              <button onClick={find} className="btn-primary">Find</button>
            </div>
          </form>

          <div className="bg-white p-4 border rounded">
            {loading ? <p>Loading...</p> : (
              result ? (
                result.error ? <div className="text-red-600">{result.error}</div> : (
                  <div>
                    <div className="font-semibold">Level: {result.level} — Session: {result.session} {result.isNew && <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">NEW</span>}</div>
                    <div className="text-sm text-slate-600">Currency: {result.currency}</div>
                    <div className="mt-3">
                      {Array.isArray(result.items) ? result.items.map((it, i) => (
                        <div key={i} className="py-1">{it.name}: <strong>{it.amount}</strong></div>
                      )) : <div>No items</div>}
                    </div>
                    {result.notes && <div className="mt-2 text-xs text-slate-500">Notes: {result.notes}</div>}
                  </div>
                )
              ) : <div className="text-slate-600">Enter level and session and click Find.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesPage;
