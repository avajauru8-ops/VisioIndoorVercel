const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  "new Date(user.validade_licenca) < new Date()",
  "new Date(user.validade_licenca as string) < new Date()"
);

fs.writeFileSync('server.ts', content);
