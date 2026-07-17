export default async function handler(req, res) {
  const { id } = req.query;

  const origin = `https://${req.headers.host}`;

  if (!id) {
    return res.status(404).send("Not found");
  }

  const data = await fetchSharedSet(id);

  if (!data) {
    return res.status(404).send("Not found");
  }

  const videos = data.videos || [];
  const total = formatTotal(videos);
  const count = videos.length;

  const title = "10分セットメーカー";
  const description = `${count}本 / 合計 ${total}`;
  const imageUrl = `${origin}/api/og?id=${encodeURIComponent(id)}`;
  const pageUrl = `${origin}/api/share?id=${encodeURIComponent(id)}`;
  const appUrl = `${origin}/share.html?id=${encodeURIComponent(id)}`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  return res.status(200).send(`<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>

<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:url" content="${pageUrl}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${imageUrl}">

<meta http-equiv="refresh" content="0;url=${appUrl}">
</head>
<body>
<p>10分セットメーカーを開いています...</p>
<script>
location.href = ${JSON.stringify(appUrl)};
</script>
</body>
</html>`);
}

async function fetchSharedSet(id) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) return null;

  const response = await fetch(
    `${url}/rest/v1/shared_sets?id=eq.${encodeURIComponent(id)}&select=*`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    }
  );

  if (!response.ok) return null;

  const rows = await response.json();
  return rows[0] || null;
}

function formatTotal(videos) {
  const seconds = videos.reduce((sum, video) => {
    return sum + durationToSeconds(video.duration);
  }, 0);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${m}:${String(s).padStart(2, "0")}`;
}

function durationToSeconds(duration) {
  const parts = String(duration).split(":").map(Number);

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
