export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = process.env.GITHUB_OWNER || 'aiwithmathieu';
  const REPO_NAME = process.env.GITHUB_REPO || 'RoadmapSaaS';
  const FILE_PATH = 'data.json';
  const BRANCH = 'main';

  if (!GITHUB_TOKEN) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });

  try {
    const data = req.body;
    if (!Array.isArray(data)) return res.status(400).json({ error: 'Body must be an array of features' });

    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const apiBase = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // Get current file SHA (needed for update)
    let sha = null;
    try {
      const existing = await fetch(`${apiBase}?ref=${BRANCH}`, { headers });
      if (existing.ok) {
        const json = await existing.json();
        sha = json.sha;
      }
    } catch (e) { /* file doesn't exist yet, that's fine */ }

    // Create or update file
    const body = {
      message: `Roadmap update — ${new Date().toLocaleString('fr-FR')}`,
      content,
      branch: BRANCH,
    };
    if (sha) body.sha = sha;

    const result = await fetch(apiBase, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!result.ok) {
      const err = await result.json();
      return res.status(result.status).json({ error: err.message });
    }

    return res.status(200).json({ ok: true, message: 'Saved to GitHub' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
