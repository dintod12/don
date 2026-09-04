import { useState, useEffect } from 'react';

const STORE_KEY = 'dinstore_data';

export default function App() {
  const [activeTab, setActiveTab] = useState('duckai');
  const [status, setStatus] = useState('Idle');
  const [preview, setPreview] = useState('Pilih menu dan jalankan request...');
  const [store, setStore] = useState([]);

  // State Form DuckAI
  const [duckModel, setDuckModel] = useState('gpt-4o-mini');
  const [duckSystem, setDuckSystem] = useState('You are a helpful assistant');
  const [duckMsg, setDuckMsg] = useState('');

  // State Form BibleAI
  const [bibleTrans, setBibleTrans] = useState('ESV');
  const [bibleQuestion, setBibleQuestion] = useState('');

  // Muat riwayat dari localStorage saat pertama kali load
  useEffect(() => {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      setStore(JSON.parse(saved));
    }
  }, []);

  const saveToStorage = (type, query, data) => {
    const newEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type,
      query,
      data
    };
    const updated = [newEntry, ...store];
    setStore(updated);
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
  };

  const handleDuckSubmit = async (e) => {
    e.preventDefault();
    if (!duckMsg.trim()) return;

    setStatus('Loading...');
    const url = `/api/duckai?message=${encodeURIComponent(duckMsg)}&model=${encodeURIComponent(duckModel)}&systemPrompt=${encodeURIComponent(duckSystem)}`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      setPreview(JSON.stringify(data, null, 2));
      setStatus('OK');
      saveToStorage('DuckAI', duckMsg, data);
    } catch (err) {
      setPreview(JSON.stringify({ error: err.message }, null, 2));
      setStatus('Error');
    }
  };

  const handleBibleSubmit = async (e) => {
    e.preventDefault();
    if (!bibleQuestion.trim()) return;

    setStatus('Loading...');
    const url = `/api/bibleai?question=${encodeURIComponent(bibleQuestion)}&translation=${encodeURIComponent(bibleTrans)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setPreview(JSON.stringify(data, null, 2));
      setStatus('OK');
      saveToStorage('BibleAI', bibleQuestion, data);
    } catch (err) {
      setPreview(JSON.stringify({ error: err.message }, null, 2));
      setStatus('Error');
    }
  };

  const clearStore = () => {
    localStorage.removeItem(STORE_KEY);
    setStore([]);
    setPreview('Store telah dibersihkan.');
  };

  return (
    <div className="app-container">
      <header className="navbar">
        <h1>Dinstore AI Hub</h1>
        <button onClick={clearStore} className="btn-danger">Bersihkan Riwayat</button>
      </header>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'duckai' ? 'active' : ''}`}
          onClick={() => setActiveTab('duckai')}
        >
          DuckAI
        </button>
        <button
          className={`tab-btn ${activeTab === 'bibleai' ? 'active' : ''}`}
          onClick={() => setActiveTab('bibleai')}
        >
          BibleAI
        </button>
      </div>

      <div className="main-grid">
        {/* Kolom Form Input */}
        <section className="card">
          {activeTab === 'duckai' ? (
            <form onSubmit={handleDuckSubmit} className="form-group">
              <label>Model</label>
              <select value={duckModel} onChange={(e) => setDuckModel(e.target.value)}>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="claude-3-5-haiku-latest">claude-3-5-haiku-latest</option>
                <option value="meta-llama/Llama-4-Scout-17B-16E-Instruct">meta-llama/Llama-4-Scout-17B-16E-Instruct</option>
                <option value="mistralai/Mistral-Small-24B-Instruct-2501">mistralai/Mistral-Small-24B-Instruct-2501</option>
                <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
                <option value="gpt-5-mini">gpt-5-mini</option>
              </select>

              <label>System Prompt</label>
              <input
                type="text"
                value={duckSystem}
                onChange={(e) => setDuckSystem(e.target.value)}
              />

              <label>Pesan</label>
              <textarea
                value={duckMsg}
                onChange={(e) => setDuckMsg(e.target.value)}
                placeholder="Pertanyaan ke AI..."
                required
              />

              <button type="submit" className="btn-primary">Kirim Request</button>
            </form>
          ) : (
            <form onSubmit={handleBibleSubmit} className="form-group">
              <label>Terjemahan</label>
              <select value={bibleTrans} onChange={(e) => setBibleTrans(e.target.value)}>
                <option value="ESV">ESV (English Standard Version)</option>
                <option value="NIV">NIV (New International Version)</option>
                <option value="KJV">KJV (King James Version)</option>
                <option value="TB">TB (Terjemahan Baru)</option>
              </select>

              <label>Pertanyaan Alkitab</label>
              <textarea
                value={bibleQuestion}
                onChange={(e) => setBibleQuestion(e.target.value)}
                placeholder="Contoh: What is faith?"
                required
              />

              <button type="submit" className="btn-primary">Kirim Request</button>
            </form>
          )}
        </section>

        {/* Kolom JSON Viewer */}
        <section className="card">
          <div className="card-header">
            <span>Response JSON</span>
            <span className={`badge ${status === 'OK' ? 'badge-ok' : status === 'Error' ? 'badge-err' : ''}`}>
              {status}
            </span>
          </div>
          <pre id="jsonPreview">{preview}</pre>
        </section>
      </div>

      {/* Tabel Data Store */}
      <section className="card">
        <h3>Data Store Riwayat Respons</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Tipe</th>
              <th>Query</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {store.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  Store kosong
                </td>
              </tr>
            ) : (
              store.map((item) => (
                <tr key={item.id}>
                  <td>{item.time}</td>
                  <td><strong>{item.type}</strong></td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.query}
                  </td>
                  <td>
                    <button
                      onClick={() => setPreview(JSON.stringify(item.data, null, 2))}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}
                    >
                      Buka
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
