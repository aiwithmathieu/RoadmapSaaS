module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  var GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  var REPO_OWNER = process.env.GITHUB_OWNER || 'aiwithmathieu';
  var REPO_NAME = process.env.GITHUB_REPO || 'RoadmapSaaS';
  var FILE_PATH = 'data.json';
  var BRANCH = 'main';

  if (!GITHUB_TOKEN) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });

  try {
    var data = req.body;
    if (!Array.isArray(data)) return res.status(400).json({ error: 'Body must be an array' });

    var jsonStr = JSON.stringify(data, null, 2);
    var content = Buffer.from(jsonStr, 'utf-8').toString('base64');

    var apiBase = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + FILE_PATH;
    var headers = {
      'Authorization': 'Bearer ' + GITHUB_TOKEN,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    var sha = null;
    try {
      var existing = await fetch(apiBase + '?ref=' + BRANCH, { headers: headers });
      if (existing.ok) { var json = await existing.json(); sha = json.sha; }
    } catch (e) {}

    var body = { message: 'Roadmap update', content: content, branch: BRANCH };
    if (sha) body.sha = sha;

    var result = await fetch(apiBase, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
    if (!result.ok) { var err = await result.json(); return res.status(result.status).json({ error: err.message }); }

    return res.status(200).json({ ok: true });
  } catch (e) { return res.status(500).json({ error: e.message }); }
};
