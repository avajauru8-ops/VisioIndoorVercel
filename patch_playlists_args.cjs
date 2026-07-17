const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /args: \[req\.user\.id, totem_id \? Number\(totem_id\) : null, titulo, tipo_midia, Number\(tempo_exibicao\), data_inicio, data_fim, arquivo_url\]/g,
  "args: [req.user.id, totem_id ? Number(totem_id) : null, titulo || '', tipo_midia || '', Number(tempo_exibicao) || 0, data_inicio || '', data_fim || '', arquivo_url || '']"
);

fs.writeFileSync('server.ts', content);
