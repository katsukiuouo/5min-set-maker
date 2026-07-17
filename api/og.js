export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(404).send("Not found");
  }

  const data = await fetchSharedSet(id);

  if (!data || !data.videos || data.videos.length === 0) {
    return res.status(404).send("Not found");
  }

  const firstVideo = data.videos[0];

  res.setHeader("Location", firstVideo.thumbnail);
  return res.status(302).end();
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
