export const config = { maxDuration: 15 };
const CREATOR = "DINSTORE";

const extractUrl = (text) => {
  if (!text) return "";
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match ? match[0].replace(/[.,!?;:)\]}]+$/g, "").trim() : text.trim();
};

const detectPlatform = (url) => {
  const u = extractUrl(url).toLowerCase();
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("spotify.com")) return "spotify";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook";
  if (u.includes("capcut.com")) return "capcut";
  return null;
};

const safeFetch = async (url) => {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    return await res.json();
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();

  const rawUrl = req.method === "POST" ? req.body?.url : req.query?.url;
  const cleanUrl = extractUrl(rawUrl);

  if (!cleanUrl) {
    return res.status(200).json({
      status: true,
      creator: CREATOR,
      message: "Gunakan parameter URL untuk mengunduh media.",
      usage: "/api/download?url=https://...",
    });
  }

  const platform = detectPlatform(cleanUrl);
  if (!platform) {
    return res.status(400).json({
      status: false,
      creator: CREATOR,
      message: "Platform tidak didukung.",
    });
  }

  const encodedUrl = encodeURIComponent(cleanUrl);
  let title = "", thumbnail = "", author = "";
  const downloads = [];

  try {
    if (platform === "tiktok") {
      const data = await safeFetch(`https://api.siputzx.my.id/api/d/tiktok/v2?url=${encodedUrl}`);
      const root = data?.data || {};
      title = root.title || "TikTok Media";
      thumbnail = root.cover || "";
      author = root.author?.nickname || "";
      if (root.play || root.video) downloads.push({ url: root.play || root.video, text: "Video (No Watermark)" });
      if (root.music) downloads.push({ url: root.music, text: "Audio (MP3)" });
    } else if (platform === "youtube") {
      const [mp4, mp3] = await Promise.all([
        safeFetch(`https://api.azbry.com/api/download/ytmp4?url=${encodedUrl}`),
        safeFetch(`https://api.azbry.com/api/download/ytmp3?url=${encodedUrl}`),
      ]);
      const valid = mp4?.result || mp3?.result;
      if (valid) {
        title = valid.title;
        thumbnail = valid.thumbnail;
        author = valid.channel || valid.author;
        if (mp4?.result?.download) downloads.push({ url: mp4.result.download, text: "Video MP4" });
        if (mp3?.result?.download) downloads.push({ url: mp3.result.download, text: "Audio MP3" });
      }
    } else if (platform === "spotify") {
      const data = await safeFetch(`https://api.azbry.com/api/download/spotify?url=${encodedUrl}`);
      if (data?.downloadLink) {
        title = data.title;
        thumbnail = data.cover;
        author = data.author;
        downloads.push({ url: data.downloadLink, text: "Audio MP3" });
      }
    }

    if (downloads.length === 0) {
      return res.status(404).json({ status: false, creator: CREATOR, message: "Media tidak ditemukan." });
    }

    return res.status(200).json({ status: true, creator: CREATOR, platform, title, thumbnail, author, downloads });
  } catch {
    return res.status(500).json({ status: false, creator: CREATOR, message: "Kesalahan server internal." });
  }
}
