export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") return res.status(455).end();

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return res.status(200).json({ status: true, warning: "Credentials missing" });

  const { type, details } = req.body || {};
  let text = `<b>SIDOWNLOAD Telemetry</b>\n`;
  if (type === "visit") text += `👤 Pengunjung Baru Membuka Web`;
  if (type === "download") text += `📥 Unduhan Diproses: ${details?.title || details?.url}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    return res.status(200).json({ status: true });
  } catch {
    return res.status(500).json({ status: false });
  }
}
