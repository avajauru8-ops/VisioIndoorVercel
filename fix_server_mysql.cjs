const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// Replace better-sqlite3 with our mysql pool
content = content.replace(/import db from '\.\/src\/db';/g, "import pool, { initDb } from './src/db';");

// Convert Express route handlers to async if they use db
content = content.replace(/app\.(get|post|put|delete)\('([^']+)',\s*(?:authenticateToken,\s*)?(?:upload\.single\([^)]+\),\s*)?\(req: any, res\)\s*=>\s*\{/g, (match, method, path) => {
    return match.replace('(req: any, res) =>', 'async (req: any, res) =>');
});

// Replace db.prepare().get()
content = content.replace(/const (\w+) = db\.prepare\('([^']+)'\)\.get\((.*?)\)(?: as any)?;/g, "const [rows_$1]: any = await pool.query('$2', [$3]);\n    const $1 = rows_$1[0];");

// Replace db.prepare().get() with no args
content = content.replace(/const (\w+) = db\.prepare\('([^']+)'\)\.get\(\)(?: as any)?;/g, "const [rows_$1]: any = await pool.query('$2');\n    const $1 = rows_$1[0];");

// Replace db.prepare().all()
content = content.replace(/const (\w+) = db\.prepare\('([^']+)'\)\.all\((.*?)\);/g, "const [$1]: any = await pool.query('$2', [$3]);");

// Replace db.prepare().all() with no args
content = content.replace(/const (\w+) = db\.prepare\('([^']+)'\)\.all\(\);/g, "const [$1]: any = await pool.query('$2');");

// Replace db.prepare().run()
content = content.replace(/db\.prepare\('([^']+)'\)\.run\((.*?)\);/g, "await pool.execute('$1', [$2]);");

// Special case for stats endpoint in server.ts:
//   const agenciesCount = db.prepare('SELECT COUNT(*) as count FROM agencia').get() as any;
//   const totemsCount = db.prepare('SELECT COUNT(*) as count FROM totens').get() as any;
//   const usersCount = db.prepare('SELECT COUNT(*) as count FROM usuarios').get() as any;
// Wait, my regex covers this:
// const agenciesCount = db.prepare('SELECT COUNT(*) as count FROM agencia').get() as any;
// -> const [rows_agenciesCount]: any = await pool.query('...'); const agenciesCount = rows_agenciesCount[0];

// Let's manually replace the remaining complex db.prepare queries
content = content.replace(/const existing = db\.prepare\('SELECT id FROM agencia WHERE usuario_id = \?'\)\.get\(req\.user\.id\);/g, 
  "const [rows_existing]: any = await pool.query('SELECT id FROM agencia WHERE usuario_id = ?', [req.user.id]);\n    const existing = rows_existing[0];");

content = content.replace(/db\.prepare\(\`([\s\S]*?)\`\)\.run\(([\s\S]*?)\);/g, "await pool.execute(`$1`, [$2]);");
content = content.replace(/db\.prepare\(\`([\s\S]*?)\`\)\.get\(([\s\S]*?)\);/g, "const [temp_rows]: any = await pool.query(`$1`, [$2]);\n    const result = temp_rows[0];");

// Search for any remaining db.prepare
if (content.includes('db.prepare')) {
  console.log("Still has db.prepare!");
}

// Ensure initDb is called before app.listen
content = content.replace(/app\.listen\(/, "initDb().then(() => {\n  app.listen(");
content = content.replace(/console\.log\(\`Server running on http:\/\/localhost:\$\{PORT\}\`\);\n  \}\);/, "console.log(`Server running on http://localhost:${PORT}`);\n  });\n}).catch(err => {\n  console.error('Failed to init DB:', err);\n});");

// One specific issue:
// const campaigns = req.user.nivel === 'admin'
//      ? db.prepare(query).all() 
//      : db.prepare(query).all(req.user.id);
// We should replace this manually.
content = content.replace(/const campaigns = req\.user\.nivel === 'admin'\s*\?\s*db\.prepare\(query\)\.all\(\)\s*:\s*db\.prepare\(query\)\.all\(req\.user\.id\);/g,
  `let campaigns;
    if (req.user.nivel === 'admin') {
      const [rows]: any = await pool.query(query);
      campaigns = rows;
    } else {
      const [rows]: any = await pool.query(query, [req.user.id]);
      campaigns = rows;
    }`);

content = content.replace(/const playlist = db\.prepare\(\`([\s\S]*?)\`\)\.all\(totem\.id\);/g, 
  "const [playlist]: any = await pool.query(`$1`, [totem.id]);");

// SQLite specific date functions in queries
// datetime('now') -> NOW()
content = content.replace(/datetime\('now'\)/g, "NOW()");

// SQLite returning insert id:
// In mysql2, execute returns [result, fields], where result.insertId is the ID.
// But we don't seem to use the returned ID from insertions in server.ts right now.

fs.writeFileSync('server.ts', content);
console.log("Replaced");
