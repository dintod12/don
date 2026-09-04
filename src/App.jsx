import { useState, useEffect } from 'react';

const STORE_KEY = 'dinstore_history';

export default function App() {
  const [search, setSearch] = useState('');
  const [openModule, setOpenModule] = useState('AI');
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [storeHistory, setStoreHistory] = useState([]);

  // State Form DuckAI
  const [duckModel, setDuckModel] = useState('gpt-4o-mini');
  const [duckSystem, setDuckSystem] = useState('You are a helpful assistant');
  const [duckMsg, setDuckMsg] = useState('');

  // State Form BibleAI
  const [bibleTrans, setBibleTrans] = useState('ESV');
  const [bibleQuestion, setBibleQuestion] = useState('');

  // Response Viewer State
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) setStoreHistory(JSON.parse(saved));
  }, []);

  const saveToLocalStore = (type, query, data) => {
    const entry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type,
      query,
      data
    };
    const updated = [entry, ...storeHistory];
    setStoreHistory(updated);
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
  };

  const handleExecuteDuck = async (e) => {
    e.preventDefault();
    if (!duckMsg.trim()) return;
    setLoading(true);

    try {
      const url = `https://api.siputzx.my.id/api/ai/duckai?message=${encodeURIComponent(duckMsg)}&model=${encodeURIComponent(duckModel)}&systemPrompt=${encodeURIComponent(duckSystem)}`;
      const res = await fetch(url);
      const data = await res.json();
      setPreviewData(data);
      saveToLocalStore('DuckAI', duckMsg, data);
    } catch (err) {
      setPreviewData({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteBible = async (e) => {
    e.preventDefault();
    if (!bibleQuestion.trim()) return;
    setLoading(true);

    try {
      const url = `https://api.siputzx.my.id/api/ai/bibleai?question=${encodeURIComponent(bibleQuestion)}&translation=${encodeURIComponent(bibleTrans)}`;
      const res = await fetch(url);
      const data = await res.json();
      setPreviewData(data);
      saveToLocalStore('BibleAI', bibleQuestion, data);
    } catch (err) {
      setPreviewData({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Topbar */}
      <header className="navbar">
        <div className="brand">
          <div className="avatar">D</div>
          <div>
            <div className="brand-title">DINSTORE</div>
            <div className="brand-sub">API SYSTEM</div>
          </div>
        </div>
        <div className="online-badge">
          <span className="dot"></span> ONLINE
        </div>
      </header>

      {/* Hero Header */}
      <div className="hero">
        <div className="pill">
          <span className="dot"></span> TERMINAL ACTIVE
        </div>
        <h1 className="hero-title">
          DINSTORE <span className="version">3.0.0</span>
        </h1>
        <p className="hero-desc">
          A comprehensive and user friendly API solution for modern applications.
        </p>

        {/* Counter Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-label">CATEGORIES</span>
            <span className="stat-value">2</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">ENDPOINTS</span>
            <span className="stat-value">2</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">STATUS</span>
            <span className="stat-value green">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input
          type="text"
          placeholder="SEARCH ENDPOINT / CATEGORY..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Module 01: AI */}
      <div className="module-card">
        <div className="module-header" onClick={() => setOpenModule(openModule === 'AI' ? null : 'AI')}>
          <div className="module-info">
            <span className="icon-diamond">◆</span>
            <div>
              <span className="module-tag">MODULE 01</span>
              <h3>AI</h3>
              <span className="module-sub">2 ENDPOINTS</span>
            </div>
          </div>
          <span className="toggle-btn">{openModule === 'AI' ? 'CLOSE ↑' : 'OPEN ↓'}</span>
        </div>

        {openModule === 'AI' && (
          <div className="module-body">
            <div className="path-label">PATH: <code>/api/ai</code></div>

            {/* Item 1: DuckAI */}
            <div className="endpoint-item">
              <div className="endpoint-header" onClick={() => setActiveEndpoint(activeEndpoint === 'duck' ? null : 'duck')}>
                <div className="endpoint-title">
                  <span className="badge-get">GET</span>
                  <span className="ep-name">AI Duckai</span>
                  <span className="ep-path">/api/ai/duckai</span>
                </div>
                <span className="expand-icon">{activeEndpoint === 'duck' ? '−' : '+'}</span>
              </div>

              {activeEndpoint === 'duck' && (
                <form onSubmit={handleExecuteDuck} className="playground-box">
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
                  <input type="text" value={duckSystem} onChange={(e) => setDuckSystem(e.target.value)} />

                  <label>Message</label>
                  <textarea rows="2" placeholder="What is the meaning of life?" value={duckMsg} onChange={(e) => setDuckMsg(e.target.value)} required />

                  <button type="submit" disabled={loading} className="btn-run">
                    {loading ? 'Executing...' : 'Execute Request'}
                  </button>
                </form>
              )}
            </div>

            {/* Item 2: BibleAI */}
            <div className="endpoint-item">
              <div className="endpoint-header" onClick={() => setActiveEndpoint(activeEndpoint === 'bible' ? null : 'bible')}>
                <div className="endpoint-title">
                  <span className="badge-get">GET</span>
                  <span className="ep-name">Bible AI</span>
                  <span className="ep-path">/api/ai/bibleai</span>
                </div>
                <span className="expand-icon">{activeEndpoint === 'bible' ? '−' : '+'}</span>
              </div>

              {activeEndpoint === 'bible' && (
                <form onSubmit={handleExecuteBible} className="playground-box">
                  <label>Translation</label>
                  <select value={bibleTrans} onChange={(e) => setBibleTrans(e.target.value)}>
                    <option value="ESV">ESV (English Standard Version)</option>
                    <option value="NIV">NIV (New International Version)</option>
                    <option value="KJV">KJV (King James Version)</option>
                    <option value="TB">TB (Terjemahan Baru)</option>
                  </select>

                  <label>Question</label>
                  <textarea rows="2" placeholder="What is faith?" value={bibleQuestion} onChange={(e) => setBibleQuestion(e.target.value)} required />

                  <button type="submit" disabled={loading} className="btn-run">
                    {loading ? 'Executing...' : 'Execute Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Terminal Output Viewer */}
      {previewData && (
        <div className="terminal-viewer">
          <div className="terminal-header">
            <span>TERMINAL RESPONSE VIEWER</span>
            <button onClick={() => setPreviewData(null)} className="btn-close-term">✕</button>
          </div>
          <pre>{JSON.stringify(previewData, null, 2)}</pre>
        </div>
      )}

      {/* Local Store / Data History */}
      <div className="module-card">
        <div className="module-header">
          <div className="module-info">
            <span className="icon-diamond red">◆</span>
            <div>
              <span className="module-tag">LOCAL DINSTORE</span>
              <h3>Stored History</h3>
              <span className="module-sub">{storeHistory.length} ENTRIES SAVED</span>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem(STORE_KEY); setStoreHistory([]); }} className="clear-btn">Clear</button>
        </div>
        <div className="history-list">
          {storeHistory.map((item) => (
            <div key={item.id} className="history-item" onClick={() => setPreviewData(item.data)}>
              <span className="badge-get">GET</span>
              <span className="h-name">{item.type}</span>
              <span className="h-query">{item.query}</span>
              <span className="h-time">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
