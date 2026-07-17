const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /res\.json\(\{ id: result\.lastInsertRowid, message: 'Usuário criado com sucesso' \}\);/g,
  "res.json({ id: Number(result.lastInsertRowid), message: 'Usuário criado com sucesso' });"
);

fs.writeFileSync('server.ts', content);
