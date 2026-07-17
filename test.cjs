const content = require('fs').readFileSync('server.ts', 'utf8');
const newContent = content.replace(/app\.post\('\/api\/auth\/login', async \(req, res\) => \{([\s\S]*?)\}\);/g, `app.post('/api/auth/login', async (req, res) => {
    try {$1} catch (err: any) { res.status(500).json({ error: err.message, stack: err.stack }); }
  });`);
require('fs').writeFileSync('server.ts', newContent);
