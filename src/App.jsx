import { useState, useEffect } from "react";
import "./style.css";

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [liveCount, setLiveCount] = useState(186);

  useEffect(() => {
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "visit" }),
    }).catch(() => {});

    const timer = setInterval(() => {
      setLiveCount((prev) => prev + (Math.random() > 0.48 ? 1 : -1));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Masukkan link terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok || !data.status) throw new Error(data.message || "Gagal memproses media.");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-container">
      {/* NAVBAR */}
      <header className="main-navbar">
        <div className="nav-brand">
          <div className="brand-badge-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 4c-3.3 0-5.5 1.6-5.5 4 0 4.6 11 2 11 6.6 0 2.6-2.2 4.4-5.5 4.4-3 0-5.6-1.5-5.6-3.4h2.8c0 .7 1.3 1.3 2.8 1.3 1.8 0 2.7-.8 2.7-1.6 0-4.6-11-2-11-6.6 0-3 2.4-4.7 5.5-4.7 2.8 0 5 1.3 5 3.3h-2.7c0-.8-1.2-1.3-2.5-1.3z" fill="#1ed760" />
            </svg>
          </div>
          <div className="brand-text">
            <h2>SIDOWNLOAD</h2>
            <span>FAST • SIMPLE • FREE</span>
          </div>
        </div>

        <nav className="nav-menu-links">
          <a href="#home" className="active">Home</a>
          <a href="#downloader">Downloader</a>
          <a href="#tools">Tools</a>
          <a href="#endpoint">Endpoint</a>
          <a href="#statistik">Statistik</a>
          <a href="#pengunjung">Pengunjung</a>
        </nav>

        <div className="nav-action">
          <button className="status-api-pill">Status API</button>
        </div>
      </header>

      {/* HERO */}
      <section className="hero-grid-section" id="home">
        <div className="hero-left-content">
          <h1 className="hero-main-heading">
            Download Cepat, <br />
            <span className="text-highlight-cyan">Tanpa Ribet</span>
          </h1>
          <p className="hero-subtext">
            Download video & audio dari berbagai platform dengan cepat, mudah dan gratis.
          </p>

          <form className="hero-input-group" onSubmit={handleDownload}>
            <div className="input-with-icon">
              <span>🔗</span>
              <input
                type="text"
                placeholder="Tempel link video atau audio di sini..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button type="submit" className="hero-submit-btn" disabled={loading}>
              {loading ? "..." : "Download →"}
            </button>
          </form>
          <span className="hero-example-hint">Contoh: https://www.tiktok.com/@user/video/1234567890</span>

          {error && <div className="hero-err-msg">❌ {error}</div>}

          {result && (
            <div className="hero-result-preview">
              <div className="result-thumb-info">
                {result.thumbnail && <img src={result.thumbnail} alt="" />}
                <div>
                  <h4>{result.title}</h4>
                  <small>{result.author || result.platform}</small>
                </div>
              </div>
              <div className="result-buttons">
                {result.downloads?.map((d, i) => (
                  <a key={i} href={d.url} target="_blank" rel="noreferrer" download className="dl-item-btn">
                    {d.text} ↓
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hero-mockup-wrapper">
          <div className="floating-sphere-glow"></div>
          <div className="phone-screen-container">
            <div className="phone-inner-card">
              <span className="hero-glow-arrow">↓</span>
            </div>
          </div>
          <div className="floating-app-icon icon-tt">♪</div>
          <div className="floating-app-icon icon-yt">▶</div>
          <div className="floating-app-icon icon-ig">📷</div>
          <div className="floating-app-icon icon-sp">🎧</div>
          <div className="floating-app-icon icon-fb">f</div>
          <div className="floating-app-icon icon-cc">✂</div>
        </div>
      </section>

      {/* METRIC CARDS */}
      <section className="metric-strip-grid" id="statistik">
        <div className="metric-card">
          <div className="metric-icon-box icon-green">👥</div>
          <div className="metric-details">
            <span className="metric-title">Total Pengunjung</span>
            <h3 className="metric-value">128.547</h3>
            <span className="metric-trend trend-green">↑ 18.2% <small>dari 7 hari terakhir</small></span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box icon-purple">📥</div>
          <div className="metric-details">
            <span className="metric-title">Total Download</span>
            <h3 className="metric-value">356.214</h3>
            <span className="metric-trend trend-green">↑ 24.7% <small>dari 7 hari terakhir</small></span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box icon-blue">📊</div>
          <div className="metric-details">
            <span className="metric-title">Total Request API</span>
            <h3 className="metric-value">812.635</h3>
            <span className="metric-trend trend-green">↑ 21.5% <small>dari 7 hari terakhir</small></span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box icon-orange">☁</div>
          <div className="metric-details">
            <span className="metric-title">Total Bandwidth</span>
            <h3 className="metric-value">2.45 TB</h3>
            <span className="metric-trend trend-green">↑ 16.3% <small>dari 7 hari terakhir</small></span>
          </div>
        </div>
      </section>

      {/* CHART & TOP COUNTRY */}
      <section className="dual-split-grid">
        <div className="card-panel">
          <div className="panel-header-row">
            <h3 className="panel-title">Statistik Pengunjung</h3>
            <select className="panel-select-filter">
              <option>7 Hari Terakhir</option>
            </select>
          </div>

          <div className="chart-stat-summary">
            <div><span className="muted-label">Pengunjung</span><h4 className="num-green">128.547</h4></div>
            <div><span className="muted-label">Pengunjung Unik</span><h4 className="num-blue">98.213</h4></div>
            <div><span className="muted-label">Page Views</span><h4 className="num-purple">312.645</h4></div>
          </div>

          <div className="chart-svg-box">
            <svg viewBox="0 0 650 200" className="chart-svg">
              <line x1="40" y1="20" x2="630" y2="20" stroke="#181d24" strokeDasharray="3" />
              <line x1="40" y1="70" x2="630" y2="70" stroke="#181d24" strokeDasharray="3" />
              <line x1="40" y1="120" x2="630" y2="120" stroke="#181d24" strokeDasharray="3" />
              <line x1="40" y1="170" x2="630" y2="170" stroke="#181d24" />

              <text x="10" y="25" fill="#475569" fontSize="10">40K</text>
              <text x="10" y="75" fill="#475569" fontSize="10">30K</text>
              <text x="10" y="125" fill="#475569" fontSize="10">20K</text>
              <text x="10" y="175" fill="#475569" fontSize="10">0</text>

              <path d="M 60 145 Q 150 130, 240 135 T 420 120 T 520 110 T 600 135" fill="none" stroke="#a855f7" strokeWidth="2.5" />
              <path d="M 60 115 Q 150 90, 240 98 T 420 95 T 520 75 T 600 95" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
              <path d="M 60 90 Q 150 65, 240 70 T 420 60 T 520 40 T 600 65" fill="none" stroke="#1ed760" strokeWidth="3" />

              <circle cx="60" cy="90" r="3.5" fill="#1ed760" />
              <circle cx="240" cy="70" r="3.5" fill="#1ed760" />
              <circle cx="420" cy="60" r="3.5" fill="#1ed760" />
              <circle cx="520" cy="40" r="4.5" fill="#1ed760" />
              <circle cx="600" cy="65" r="3.5" fill="#1ed760" />

              <text x="50" y="195" fill="#64748b" fontSize="10">18 Mei</text>
              <text x="140" y="195" fill="#64748b" fontSize="10">19 Mei</text>
              <text x="230" y="195" fill="#64748b" fontSize="10">20 Mei</text>
              <text x="320" y="195" fill="#64748b" fontSize="10">21 Mei</text>
              <text x="410" y="195" fill="#64748b" fontSize="10">22 Mei</text>
              <text x="500" y="195" fill="#64748b" fontSize="10">23 Mei</text>
              <text x="585" y="195" fill="#64748b" fontSize="10">24 Mei</text>
            </svg>
            <div className="chart-legend-row">
              <span><i className="legend-marker dot-green"></i> Pengunjung</span>
              <span><i className="legend-marker dot-blue"></i> Pengunjung Unik</span>
              <span><i className="legend-marker dot-purple"></i> Page Views</span>
            </div>
          </div>
        </div>

        <div className="card-panel">
          <h3 className="panel-title">Top Negara</h3>
          <div className="map-preview-box">
            <svg viewBox="0 0 320 120" className="map-svg">
              <path d="M20 40 Q 60 20, 100 50 T 180 40 T 260 60 T 300 30" stroke="#16202c" strokeWidth="22" strokeLinecap="round" fill="none" />
              <circle cx="215" cy="75" r="14" fill="#1ed760" opacity="0.3" />
              <circle cx="215" cy="75" r="5" fill="#1ed760" />
              <circle cx="180" cy="65" r="4" fill="#3b82f6" />
            </svg>
          </div>
          <div className="country-rating-list">
            <div className="country-row">
              <span className="country-title">🇮🇩 Indonesia</span>
              <div className="progress-bg"><div className="progress-fill" style={{ width: "62.45%" }}></div></div>
              <span className="country-rate">62.45%</span>
            </div>
            <div className="country-row">
              <span className="country-title">🇲🇾 Malaysia</span>
              <div className="progress-bg"><div className="progress-fill" style={{ width: "12.18%" }}></div></div>
              <span className="country-rate">12.18%</span>
            </div>
            <div className="country-row">
              <span className="country-title">🇮🇳 India</span>
              <div className="progress-bg"><div className="progress-fill" style={{ width: "6.24%" }}></div></div>
              <span className="country-rate">6.24%</span>
            </div>
            <div className="country-row">
              <span className="country-title">🇺🇸 United States</span>
              <div className="progress-bg"><div className="progress-fill" style={{ width: "4.21%" }}></div></div>
              <span className="country-rate">4.21%</span>
            </div>
            <div className="country-row">
              <span className="country-title">🇸🇬 Singapore</span>
              <div className="progress-bg"><div className="progress-fill" style={{ width: "3.21%" }}></div></div>
              <span className="country-rate">3.21%</span>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE PENGUNJUNG & DOWNLOAD TERBARU */}
      <section className="dual-split-grid" id="pengunjung">
        <div className="card-panel">
          <div className="panel-header-row">
            <h3 className="panel-title flex-align">
              <span className="live-pulsing-badge"></span> Live Pengunjung
            </h3>
            <span className="live-number-label">{liveCount}</span>
          </div>
          <div className="table-wrapper">
            <table className="panel-table">
              <thead>
                <tr>
                  <th>WAKTU</th>
                  <th>NEGARA</th>
                  <th>HALAMAN</th>
                  <th>PERANGKAT</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>● 19:01:23</td><td>🇮🇩 Indonesia</td><td><code>/downloader/tiktok</code></td><td>Android - Chrome</td></tr>
                <tr><td>● 19:01:18</td><td>🇲🇾 Malaysia</td><td><code>/downloader/youtube</code></td><td>Android - Chrome</td></tr>
                <tr><td>● 19:01:15</td><td>🇮🇩 Indonesia</td><td><code>/downloader/spotify</code></td><td>Windows - Chrome</td></tr>
                <tr><td>● 19:01:11</td><td>🇮🇳 India</td><td><code>/api/docs</code></td><td>Android - Firefox</td></tr>
                <tr><td>● 19:01:07</td><td>🇸🇬 Singapore</td><td><code>/downloader/instagram</code></td><td>iPhone - Safari</td></tr>
              </tbody>
            </table>
          </div>
          <button className="panel-footer-btn">Lihat Semua Pengunjung →</button>
        </div>

        <div className="card-panel">
          <h3 className="panel-title">Download Terbaru</h3>
          <div className="recent-media-list">
            <div className="media-item">
              <div className="platform-icon-box bg-tiktok">♪</div>
              <div className="media-item-info"><h5>TikTok Video</h5><span>00:00:15 • MP4</span></div>
              <span className="media-item-time">19:01:21</span>
            </div>
            <div className="media-item">
              <div className="platform-icon-box bg-youtube">▶</div>
              <div className="media-item-info"><h5>YouTube Video</h5><span>00:03:45 • MP4</span></div>
              <span className="media-item-time">19:01:18</span>
            </div>
            <div className="media-item">
              <div className="platform-icon-box bg-spotify">🎧</div>
              <div className="media-item-info"><h5>Spotify Audio</h5><span>MP3 • 3.21 MB</span></div>
              <span className="media-item-time">19:01:11</span>
            </div>
          </div>
          <button className="panel-footer-btn">Lihat Semua Riwayat →</button>
        </div>
      </section>

      {/* ENDPOINT & STATISTIK HARI INI */}
      <section className="dual-split-grid" id="endpoint">
        <div className="card-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">Endpoint / API</h3>
              <p className="panel-sub-desc">Daftar semua endpoint yang tersedia untuk digunakan.</p>
            </div>
            <button className="green-pill-action">Lihat Dokumentasi</button>
          </div>
          <div className="table-wrapper">
            <table className="panel-table">
              <thead>
                <tr>
                  <th>METHOD</th>
                  <th>ENDPOINT</th>
                  <th>DESKRIPSI</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><span className="http-tag-get">GET</span></td><td><code>/api/download/tiktok</code></td><td>Download video TikTok</td><td><span className="status-live-dot">● Online</span></td></tr>
                <tr><td><span className="http-tag-get">GET</span></td><td><code>/api/download/ytmp4</code></td><td>Download video YouTube</td><td><span className="status-live-dot">● Online</span></td></tr>
                <tr><td><span className="http-tag-get">GET</span></td><td><code>/api/download/spotify</code></td><td>Download lagu Spotify</td><td><span className="status-live-dot">● Online</span></td></tr>
                <tr><td><span className="http-tag-get">GET</span></td><td><code>/api/download/instagram</code></td><td>Download video Instagram</td><td><span className="status-live-dot">● Online</span></td></tr>
              </tbody>
            </table>
          </div>
          <button className="panel-footer-btn">Lihat Semua Endpoint →</button>
        </div>

        <div className="column-stacked">
          <div className="card-panel">
            <h3 className="panel-title">Statistik Hari Ini</h3>
            <div className="today-stats-grid">
              <div className="today-item"><div className="mini-icon icon-green">👥</div><div className="today-item-meta"><span>Pengunjung</span><h4>12.845</h4></div></div>
              <div className="today-item"><div className="mini-icon icon-purple">📥</div><div className="today-item-meta"><span>Download</span><h4>28.954</h4></div></div>
              <div className="today-item"><div className="mini-icon icon-blue">‹/›</div><div className="today-item-meta"><span>Request</span><h4>64.512</h4></div></div>
              <div className="today-item"><div className="mini-icon icon-orange">☁</div><div className="today-item-meta"><span>Bandwidth</span><h4>356.21 GB</h4></div></div>
            </div>
          </div>
          <div className="card-panel">
            <h3 className="panel-title">Aktivitas Terbaru</h3>
            <div className="activity-feed">
              <div className="activity-item"><span>🇮🇩 Pengunjung dari Indonesia</span><small>19:01:23</small></div>
              <div className="activity-item"><span>♪ Download TikTok Video</span><small>19:01:21</small></div>
            </div>
            <button className="panel-footer-btn">Lihat Semua Aktivitas →</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="portal-footer">
        <div className="footer-columns-grid">
          <div className="footer-col-brand">
            <div className="nav-brand">
              <div className="brand-badge-logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4c-3.3 0-5.5 1.6-5.5 4 0 4.6 11 2 11 6.6 0 2.6-2.2 4.4-5.5 4.4-3 0-5.6-1.5-5.6-3.4h2.8c0 .7 1.3 1.3 2.8 1.3 1.8 0 2.7-.8 2.7-1.6 0-4.6-11-2-11-6.6 0-3 2.4-4.7 5.5-4.7 2.8 0 5 1.3 5 3.3h-2.7c0-.8-1.2-1.3-2.5-1.3z" fill="#1ed760" />
                </svg>
              </div>
              <div className="brand-text">
                <h2>SIDOWNLOAD</h2>
                <span>FAST • SIMPLE • FREE</span>
              </div>
            </div>
            <p className="footer-brand-desc">Platform download gratis, cepat, mudah dan tanpa ribet.</p>
          </div>

          <div className="footer-col-nav">
            <h4>Platform</h4>
            <ul>
              <li>TikTok</li>
              <li>YouTube</li>
              <li>Instagram</li>
              <li>Spotify</li>
              <li>Facebook</li>
            </ul>
          </div>

          <div className="footer-col-nav">
            <h4>Tools</h4>
            <ul>
              <li>TikTok Downloader</li>
              <li>YouTube Downloader</li>
              <li>Spotify Downloader</li>
              <li>Instagram Downloader</li>
            </ul>
          </div>

          <div className="footer-col-nav">
            <h4>Informasi</h4>
            <ul>
              <li>About</li>
              <li>API</li>
              <li>Dokumentasi</li>
              <li>Privacy</li>
            </ul>
          </div>

          <div className="footer-col-cta">
            <div className="api-cta-box">
              <h4>API Access</h4>
              <p>Gunakan API kami untuk integrasi di website atau bot kamu.</p>
              <button className="cta-green-btn">Lihat Dokumentasi API →</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>© 2026 SIDOWNLOAD. All rights reserved.</span>
          <span>Made with ❤️ for everyone</span>
        </div>
      </footer>
    </div>
  );
}
