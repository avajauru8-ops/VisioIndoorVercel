const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// fix bcrypt.compareSync(senha, user.senha)
content = content.replace(/bcrypt\.compareSync\(senha,\s*user\.senha\)/g, "bcrypt.compareSync(senha, user.senha as string)");

// fix args: [device_id]
content = content.replace(/args:\s*\[device_id\]/g, "args: [device_id as string]");

// fix new Date(user.validade_licenca)
content = content.replace(/new Date\(user\.validade_licenca\)/g, "new Date(user.validade_licenca as string)");

// fix req.params.id not working with sqlite3
// Actually req.params.id is string which is fine. Wait, maybe it's fine.

fs.writeFileSync('server.ts', content);
