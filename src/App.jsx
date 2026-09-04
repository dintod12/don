import { useState, useEffect } from "react";
import "./style.css";

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // STATE REAL-TIME
  const [liveCount, setLiveCount] = useState(1);
  const [userGeo, setUserGeo] = useState({
    country: "Indonesia",
    flag: "🇮🇩",
    city: "Jakarta",
    device: "Desktop - Chrome",
  });

  const [liveVisitors, setLiveVisitors] = useState([
    {
      time: "19:01:23",
      country: "Indonesia",
      flag: "🇮🇩",
      path: "/downloader/tiktok",
      device: "Android - Chrome",
    },
    {
      time: "19:01:18",
      country: "Malaysia",
      flag: "🇲🇾",
      path: "/downloader/youtube",
      device: "Android - Chrome",
    },
    {
      time: "19:01:15",
      country: "Indonesia",
      flag: "🇮🇩",
      path: "/downloader/spotify",
      device: "Windows - Chrome",
    },
    {
      time: "19:01:11",
      country: "India",
      flag: "🇮🇳",
      path: "/api/docs",
      device: "Android - Firefox",
    },
    {
      time: "19:01:07",
      country: "Singapore",
      flag: "🇸🇬",
      path: "/downloader/instagram",
      device: "iPhone - Safari",
    },
  ]);

  const [recentDownloads, setRecentDownloads] = useState([
    { title: "TikTok Video", duration: "00:00:15 • MP4", time: "19:01:21", type: "tiktok", icon: "♪" },
    { title: "YouTube Video", duration: "00:03:45 • MP4 (1080p)", time: "19:01:18", type: "youtube", icon: "▶" },
    { title: "Spotify Audio", duration: "MP3 • 3.21 MB", time: "19:01:11", type: "spotify", icon: "🎧" },
  ]);

  const [activities, setActivities] = useState([
    { text: "🇮🇩 Pengunjung dari Indonesia", time: "19:01:23" },
    { text: "♪ Download TikTok Video", time: "19:01:21" },
    { text: "⚡ Request API /api/download/ytmp4", time: "19:01:18" },
    { text: "🎧 Download Spotify Audio", time: "19:01:11" },
  ]);

  // DETEKSI PERANGKAT ASLI
  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let os = "Windows";
    if (/Android/i.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/i.test(ua)) os = "iPhone";
    else if (/Mac/i.test(ua)) os = "macOS";
    else if (/Linux/i.test(ua)) os = "Linux";

    let browser = "Chrome";
    if (/Firefox/i.test(ua)) browser = "Firefox";
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
    else if (/Edge/i.test(ua)) browser = "Edge";

    return `${os} - ${browser}`;
  };

  const getTimeString = () => {
    return new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // 1. AMBIL DATA PENGUNJUNG ASLI (GEO IP)
  useEffect(() => {
    const device = getDeviceInfo();

    fetch("https://ipwho.is/")
      .then((res) => res.json())
      .then((data) => {
        const country = data.country || "Indonesia";
        const flag = data.country_code === "ID" ? "🇮🇩" : data.country_code === "MY" ? "🇲🇾" : data.country_code === "SG" ? "🇸🇬" : "🌐";
        const currentData = {
          country,
          flag,
          city: data.city || "Online",
          device,
        };

        setUserGeo(currentData);

        // Masukkan pengunjung ini ke tabel Live Pengunjung real-time
        const newLog = {
          time: getTimeString(),
          country: `${currentData.country} (${currentData.city})`,
          flag: currentData.flag,
          path: window.location.pathname || "/",
          device: currentData.device,
        };

        setLiveVisitors((prev) => [newLog, ...prev.slice(0, 5)]);
        setActivities((prev) => [
          { text: `${flag} Pengunjung dari ${currentData.country}`, time: getTimeString() },
          ...prev.slice(0, 4),
        ]);
      })
      .catch(() => {
        setUserGeo((prev) => ({ ...prev, device }));
      });

    // Simulasi traffic acak natural
    const interval = setInterval(() => {
      setLiveCount((prev) => Math.max(120, prev + (Math.random() > 0.48 ? 1 : -1)));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // 2. LOGIKA DOWNLOAD DAN TAMBAH AKTIVITAS REALTIME
  const handleDownload = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Masukkan link video atau audio terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const currentTime = getTimeString();

    // Catat log request
    setActivities((prev) => [
      { text: `⚡ Memproses link: ${url.substring(0, 24)}...`, time: currentTime },
      ...prev.slice(0, 4),
    ]);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok || !data.status) {
        throw new Error(data.message || "Gagal memproses link media.");
      }

      setResult(data);

      // Tambahkan ke Download Terbaru secara real-time
      const newDl = {
        title: data.title || "Media Download",
        duration: data.duration ? `${data.duration} • MP4` : "Direct File",
        time: currentTime,
        type: data.platform || "tiktok",
        icon: data.platform === "youtube" ? "▶" : data.platform === "spotify" ? "🎧" : "♪",
      };

      setRecentDownloads((prev) => [newDl, ...prev.slice(0, 4)]);
      setActivities((prev) => [
        { text: `✅ Berhasil unduh ${data.platform?.toUpperCase()}`, time: currentTime },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-container">
      {/* ================= NAVBAR ================= */}
      <header className="main-navbar">
        <div className="nav-brand">
          <div className="brand-badge-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4c-3.3 0-5.5 1.6-5.5 4 0 4.6 11 2 11 6.6 0 2.6-2.2 4.4-5.5 4.4-3 0-5.6-1.5-5.6-3.4h2.8c0 .7 1.3 1.3 2.8 1.3 1.8 0 2.7-.8 2.7-1.6 0-4.6-11-2-11-6.6 0-3 2.4-4.7 5.5-4.7 2.8 0 5 1.3 5 3.3h-2.7c0-.8-1.2-1.3-2.5-1.3z"
                fill="#1ed760"
              />
            </svg>
          </div>
          <div className="brand-text">
            <h2>SIDOWNLOAD</h2>
            <span>FAST • SIMPLE • FREE</span>
          </div>
        </div>

        <nav className="nav-menu-links">
          <a href="#home" className="active">Home</a>
          <a href="#downloader">Downloader ⌄</a>
          <a href="#tools">Tools ⌄</a>
          <a href="#endpoint">Endpoint</a>
          <a href="#statistik">Statistik</a>
          <a href="#pengunjung">Pengunjung</a>
        </nav>

        <div className="nav-action">
          <button className="status-api-pill">● Status API Online</button>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
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
              <span className="link-icon">🔗</span>
              <input
                type="text"
                placeholder="Tempel link video atau audio di sini..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
              />
            </div>
            <button type="submit" className="hero-submit-btn" disabled={loading}>
              {loading ? "Memproses..." : "Download →"}
            </button>
          </form>
          <span className="hero-example-hint">
            Lokasi Anda terdeteksi: <b>{userGeo.flag} {userGeo.country} ({userGeo.city})</b> • {userGeo.device}
          </span>

          {error && <div className="hero-err-msg">❌ {error}</div>}

          {result && (
            <div className="hero-result-preview">
              <div className="result-thumb-info">
                {result.thumbnail && <img src={result.thumbnail} alt="Preview" />}
                <div>
                  <h4>{result.title}</h4>
                  <small>{result.author || result.platform}</small>
                </div>
              </div>
              <div className="result-buttons">
                {result.downloads?.map((item, idx) => (
                  <a key={idx} href={item.url} target="_blank" rel="noreferrer" download className="dl-item-btn">
                    {item.text} ↓
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* HERO MOCKUP RIGHT */}
        <div className="hero-mockup-wrapper">
          <div className="floating-sphere-glow"></div>
          <div className="phone-screen-container">
            <div className="phone-inner-card">
              <div className="phone-download-target">
                <span className="hero-glow-arrow">↓</span>
              </div>
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

      {/* ================= 4 METRIC STAT CARDS ================= */}
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

      {/* ================= STATISTIK PENGUNJUNG & TOP NEGARA ================= */}
      <section className="dual-split-grid">
        <div className="card-panel">
          <div className="panel-header-row">
            <h3 className="panel-title">Statistik Pengunjung</h3>
            <select className="panel-select-filter">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>

          <div className="chart-stat-summary">
            <div>
              <span className="muted-label">Pengunjung</span>
              <h4 className="num-green">128.547</h4>
            </div>
            <div>
              <span className="muted-label">Pengunjung Unik</span>
              <h4 className="num-blue">98.213</h4>
            </div>
            <div>
              <span className="muted-label">Page Views</span>
              <h4 className="num-purple">312.645</h4>
            </div>
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
              <circle cx="85" cy="45" r="4" fill="#64748b" />
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

      {/* ================= LIVE PENGUNJUNG & DOWNLOAD TERBARU ================= */}
      <section className="dual-split-grid" id="pengunjung">
        {/* TABEL LIVE VISITORS REALTIME */}
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
                {liveVisitors.map((v, i) => (
                  <tr key={i}>
                    <td><span className="live-dot-mini">●</span> {v.time}</td>
                    <td>{v.flag} {v.country}</td>
                    <td><code>{v.path}</code></td>
                    <td>{v.device}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="panel-footer-btn">Lihat Semua Pengunjung →</button>
        </div>

        {/* DOWNLOAD TERBARU REALTIME */}
        <div className="card-panel">
          <h3 className="panel-title">Download Terbaru</h3>
          <div className="recent-media-list">
            {recentDownloads.map((dl, i) => (
              <div className="media-item" key={i}>
                <div className={`platform-icon-box bg-${dl.type}`}>
                  {dl.icon}
                </div>
                <div className="media-item-info">
                  <h5>{dl.title}</h5>
                  <span>{dl.duration}</span>
                </div>
                <span className="media-item-time">{dl.time}</span>
              </div>
            ))}
          </div>

          <button className="panel-footer-btn">Lihat Semua Riwayat →</button>
        </div>
      </section>

      {/* ================= ENDPOINT API & STATISTIK HARI INI ================= */}
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
                <tr>
                  <td><span className="http-tag-get">GET</span></td>
                  <td><code>/api/download/tiktok</code></td>
                  <td>Download video TikTok</td>
                  <td><span className="status-live-dot">● Online</span></td>
                </tr>
                <tr>
                  <td><span className="http-tag-get">GET</span></td>
                  <td><code>/api/download/ytmp4</code></td>
                  <td>Download video YouTube (MP4)</td>
                  <td><span className="status-live-dot">● Online</span></td>
                </tr>
                <tr>
                  <td><span className="http-tag-get">GET</span></td>
                  <td><code>/api/download/ytmp3</code></td>
                  <td>Download audio YouTube (MP3)</td>
                  <td><span className="status-live-dot">● Online</span></td>
                </tr>
                <tr>
                  <td><span className="http-tag-get">GET</span></td>
                  <td><code>/api/download/spotify</code></td>
                  <td>Download lagu Spotify (MP3)</td>
                  <td><span className="status-live-dot">● Online</span></td>
                </tr>
                <tr>
                  <td><span className="http-tag-get">GET</span></td>
                  <td><code>/api/download/instagram</code></td>
                  <td>Download video Instagram</td>
                  <td><span className="status-live-dot">● Online</span></td>
                </tr>
                <tr>
                  <td><span className="http-tag-get">GET</span></td>
                  <td><code>/api/tools/checker-ban-wa</code></td>
                  <td>Cek ban WhatsApp</td>
                  <td><span className="status-live-dot">● Online</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <button className="panel-footer-btn">Lihat Semua Endpoint →</button>
        </div>

        {/* STATISTIK & AKTIVITAS FEED REALTIME */}
        <div className="column-stacked">
          <div className="card-panel">
            <h3 className="panel-title">Statistik Hari Ini</h3>
            <div className="today-stats-grid">
              <div className="today-item">
                <div className="mini-icon icon-green">👥</div>
                <div className="today-item-meta">
                  <span>Pengunjung Hari Ini</span>
                  <h4>12.845</h4>
                </div>
              </div>
              <div className="today-item">
                <div className="mini-icon icon-purple">📥</div>
                <div className="today-item-meta">
                  <span>Download Hari Ini</span>
                  <h4>28.954</h4>
                </div>
              </div>
              <div className="today-item">
                <div className="mini-icon icon-blue">‹/›</div>
                <div className="today-item-meta">
                  <span>Request API Hari Ini</span>
                  <h4>64.512</h4>
                </div>
              </div>
              <div className="today-item">
                <div className="mini-icon icon-orange">☁</div>
                <div className="today-item-meta">
                  <span>Bandwidth Hari Ini</span>
                  <h4>356.21 GB</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="card-panel">
            <h3 className="panel-title">Aktivitas Terbaru</h3>
            <div className="activity-feed">
              {activities.map((act, i) => (
                <div className="activity-item" key={i}>
                  <span>{act.text}</span>
                  <small>{act.time}</small>
                </div>
              ))}
            </div>
            <button className="panel-footer-btn">Lihat Semua Aktivitas →</button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="portal-footer">
        <div className="footer-columns-grid">
          <div className="footer-col-brand">
            <div className="nav-brand">
              <div className="brand-badge-logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 4c-3.3 0-5.5 1.6-5.5 4 0 4.6 11 2 11 6.6 0 2.6-2.2 4.4-5.5 4.4-3 0-5.6-1.5-5.6-3.4h2.8c0 .7 1.3 1.3 2.8 1.3 1.8 0 2.7-.8 2.7-1.6 0-4.6-11-2-11-6.6 0-3 2.4-4.7 5.5-4.7 2.8 0 5 1.3 5 3.3h-2.7c0-.8-1.2-1.3-2.5-1.3z"
                    fill="#1ed760"
                  />
                </svg>
              </div>
              <div className="brand-text">
                <h2>SIDOWNLOAD</h2>
                <span>FAST • SIMPLE • FREE</span>
              </div>
            </div>
            <p className="footer-brand-desc">
              Platform download gratis, cepat, mudah dan tanpa ribet.
            </p>
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
              <li>Cek Ban WhatsApp</li>
            </ul>
          </div>

          <div className="footer-col-nav">
            <h4>Informasi</h4>
            <ul>
              <li>About</li>
              <li>API</li>
              <li>Dokumentasi</li>
              <li>Terms</li>
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
