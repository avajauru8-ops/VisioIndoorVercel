const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /app\.post\('\/api\/agency\/profile', authenticateToken, upload\.single\('logo'\), async \(req: any, res\) => \{([\s\S]*?res\.json\(\{ message: 'Perfil atualizado' \}\);\n  \}\);)/m,
  `app.post('/api/agency/profile', authenticateToken, upload.single('logo'), async (req: any, res) => {
    try {
      const { nome, cpf_cnpj, endereco, cidade, estado, whatsapp, cidades_atuacao } = req.body;
      let logo_url = req.body.logo_url;
      if (req.file) {
        logo_url = await handleFileUpload(req.file);
      }
      
      const { rows: rows_existing } = await db.execute({ sql: 'SELECT id FROM agencia WHERE usuario_id = ?', args: [req.user.id] });
      const existing = rows_existing[0];
      if (existing) {
        await db.execute({ sql: \`
          UPDATE agencia SET nome = ?, cpf_cnpj = ?, endereco = ?, cidade = ?, estado = ?, whatsapp = ?, cidades_atuacao = ?, logo_url = ?
          WHERE usuario_id = ?
        \`, args: [nome || '', cpf_cnpj || '', endereco || null, cidade || null, estado || null, whatsapp || null, cidades_atuacao || null, logo_url || null, req.user.id] });
      } else {
        await db.execute({ sql: \`
          INSERT INTO agencia (usuario_id, nome, cpf_cnpj, endereco, cidade, estado, whatsapp, cidades_atuacao, logo_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        \`, args: [req.user.id, nome || '', cpf_cnpj || '', endereco || null, cidade || null, estado || null, whatsapp || null, cidades_atuacao || null, logo_url || null] });
      }
      res.json({ message: 'Perfil atualizado' });
    } catch(err: any) {
      console.error('Error saving profile:', err);
      res.status(500).json({ error: err.message });
    }
  });`
);

fs.writeFileSync('server.ts', content);
