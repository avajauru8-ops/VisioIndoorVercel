const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace import
code = code.replace(/import supabase from '\.\/src\/db\/index\.js';/, "import pool, { initDb } from './src/db/index.js';");

// Restore dbInitialized logic right before app.use(cors()) if missing
if (!code.includes('let dbInitialized = false;')) {
  code = code.replace(/app\.use\(cors\(\)\);/, `
let dbInitialized = false;
let dbInitPromise: Promise<void> | null = null;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    if (!dbInitPromise) {
      dbInitPromise = initDb().then(() => {
        dbInitialized = true;
        console.log('Database initialized successfully.');
      }).catch(err => {
        console.error('Failed to init DB:', err.message);
        throw err;
      });
    }
    try {
      await dbInitPromise;
    } catch (err) {
      return res.status(500).json({ error: 'Failed to initialize database' });
    }
  }
  next();
});\napp.use(cors());`);
}

// 1. Auth Login
code = code.replace(
  /const \{ data: rows_user, error \} = await supabase\.from\('usuarios'\)\.select\('\*'\)\.eq\('email', email\);/,
  "const [rows_user]: any = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);"
);
code = code.replace(/const user = rows_user\[0\];/, "const user = rows_user[0];"); // Make sure it exists

// 2. Admin Users Get
code = code.replace(
  /const \{ data: users \} = await supabase\.from\('usuarios'\)\.select\('id, nome, cpf, email, nivel, status_licenca, validade_licenca, created_at'\);/,
  "const [users]: any = await pool.query('SELECT id, nome, cpf, email, nivel, status_licenca, validade_licenca, created_at FROM usuarios');"
);

// 3. Admin Users Post
code = code.replace(
  /const \{ data, error \} = await supabase\.from\('usuarios'\)\.insert\(\{ nome, cpf, email, senha: hash, nivel, validade_licenca \}\)\.select\(\);\n\s*if \(error\) throw error;\n\s*res\.json\(\{ id: data\[0\]\.id, message: 'Usuário criado com sucesso' \}\);/,
  "const [result]: any = await pool.execute('INSERT INTO usuarios (nome, cpf, email, senha, nivel, validade_licenca) VALUES (?, ?, ?, ?, ?, ?)', [nome, cpf, email, hash, nivel, validade_licenca]);\n      res.json({ id: result.insertId, message: 'Usuário criado com sucesso' });"
);

// 4. Admin Users License Update
code = code.replace(
  /await supabase\.from\('usuarios'\)\.update\(\{ status_licenca, validade_licenca \}\)\.eq\('id', Number\(req\.params\.id\)\);/,
  "await pool.execute('UPDATE usuarios SET status_licenca = ?, validade_licenca = ? WHERE id = ?', [status_licenca, validade_licenca, Number(req.params.id)]);"
);

// 5. Admin Settings Get
code = code.replace(
  /const \{ data: rows_settings \} = await supabase\.from\('configuracoes_admin'\)\.select\('\*'\)\.eq\('id', 1\);/,
  "const [rows_settings]: any = await pool.query('SELECT * FROM configuracoes_admin WHERE id = 1');"
);

// 6. Admin Settings Update
code = code.replace(
  /await supabase\.from\('configuracoes_admin'\)\.update\(\{ nome_painel, logo_url \}\)\.eq\('id', 1\);/,
  "await pool.execute('UPDATE configuracoes_admin SET nome_painel = ?, logo_url = ? WHERE id = 1', [nome_painel, logo_url]);"
);

// 7. Agency Profile Get
code = code.replace(
  /const \{ data: rows_profile \} = await supabase\.from\('agencia'\)\.select\('\*'\)\.eq\('usuario_id', req\.user\.id\);/,
  "const [rows_profile]: any = await pool.query('SELECT * FROM agencia WHERE usuario_id = ?', [req.user.id]);"
);

// 8. Agency Profile Post
code = code.replace(
  /const \{ data: rows_existing \} = await supabase\.from\('agencia'\)\.select\('id'\)\.eq\('usuario_id', req\.user\.id\);/,
  "const [rows_existing]: any = await pool.query('SELECT id FROM agencia WHERE usuario_id = ?', [req.user.id]);"
);
code = code.replace(
  /await supabase\.from\('agencia'\)\.update\(\{ nome: nome\|\|'', cpf_cnpj: cpf_cnpj\|\|'', endereco, cidade, estado, whatsapp, cidades_atuacao, logo_url \}\)\.eq\('usuario_id', req\.user\.id\);/,
  "await pool.execute('UPDATE agencia SET nome = ?, cpf_cnpj = ?, endereco = ?, cidade = ?, estado = ?, whatsapp = ?, cidades_atuacao = ?, logo_url = ? WHERE usuario_id = ?', [nome||'', cpf_cnpj||'', endereco||null, cidade||null, estado||null, whatsapp||null, cidades_atuacao||null, logo_url||null, req.user.id]);"
);
code = code.replace(
  /await supabase\.from\('agencia'\)\.insert\(\{ usuario_id: req\.user\.id, nome: nome\|\|'', cpf_cnpj: cpf_cnpj\|\|'', endereco, cidade, estado, whatsapp, cidades_atuacao, logo_url \}\);/,
  "await pool.execute('INSERT INTO agencia (usuario_id, nome, cpf_cnpj, endereco, cidade, estado, whatsapp, cidades_atuacao, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [req.user.id, nome||'', cpf_cnpj||'', endereco||null, cidade||null, estado||null, whatsapp||null, cidades_atuacao||null, logo_url||null]);"
);

// 9. Totems Get
code = code.replace(
  /\/\/ Update offline status[\s\S]*?totems = data;\s*\}/,
  `// Update offline status
    await pool.execute("UPDATE totens SET status = 'offline' WHERE ultima_sincronizacao < NOW() - INTERVAL 2 MINUTE OR ultima_sincronizacao IS NULL");

    let totems;
    if (req.user.nivel === 'admin') {
      const [rows]: any = await pool.query('SELECT * FROM totens');
      totems = rows;
    } else {
      const [rows]: any = await pool.query('SELECT * FROM totens WHERE usuario_id = ?', [req.user.id]);
      totems = rows;
    }`
);

// 10. Totems Post
code = code.replace(
  /const \{ error \} = await supabase\.from\('totens'\)\.insert\(\{ usuario_id: req\.user\.id, nome, device_id \}\); if \(error\) throw error;/,
  "await pool.execute('INSERT INTO totens (usuario_id, nome, device_id) VALUES (?, ?, ?)', [req.user.id, nome, device_id]);"
);

// 11. Totems Delete
code = code.replace(
  /await supabase\.from\('totens'\)\.delete\(\)\.eq\('id', Number\(req\.params\.id\)\)\.eq\('usuario_id', req\.user\.id\);/,
  "await pool.execute('DELETE FROM totens WHERE id = ? AND usuario_id = ?', [Number(req.params.id), req.user.id]);"
);

// 12. Playlists Get
code = code.replace(
  /const \{ data: campaigns \} = await supabase\.from\('campanhas'\)\.select\('\*'\)\.eq\('usuario_id', req\.user\.id\);/,
  "const [campaigns]: any = await pool.query('SELECT * FROM campanhas WHERE usuario_id = ?', [req.user.id]);"
);

// 13. Playlists Post
code = code.replace(
  /await supabase\.from\('campanhas'\)\.insert\(\{ usuario_id: req\.user\.id, totem_id: totem_id \? Number\(totem_id\) : null, titulo: titulo \|\| '', tipo_midia: tipo_midia \|\| '', tempo_exibicao: Number\(tempo_exibicao\) \|\| 0, data_inicio: data_inicio \|\| '', data_fim: data_fim \|\| '', arquivo_url: arquivo_url \|\| '' \}\);/,
  "await pool.execute('INSERT INTO campanhas (usuario_id, totem_id, titulo, tipo_midia, tempo_exibicao, data_inicio, data_fim, arquivo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [req.user.id, totem_id ? Number(totem_id) : null, titulo || '', tipo_midia || '', Number(tempo_exibicao) || 0, data_inicio || '', data_fim || '', arquivo_url || '']);"
);

// 14. Playlists Delete
code = code.replace(
  /await supabase\.from\('campanhas'\)\.delete\(\)\.eq\('id', Number\(req\.params\.id\)\)\.eq\('usuario_id', req\.user\.id\);/,
  "await pool.execute('DELETE FROM campanhas WHERE id = ? AND usuario_id = ?', [Number(req.params.id), req.user.id]);"
);

// 15. API PHP Validations
code = code.replace(
  /const \{ data: rows_totem \} = await supabase\.from\('totens'\)\.select\('\*'\)\.eq\('device_id', device_id as string\);/,
  "const [rows_totem]: any = await pool.query('SELECT * FROM totens WHERE device_id = ?', [device_id as string]);"
);

code = code.replace(
  /const \{ data: rows_user \} = await supabase\.from\('usuarios'\)\.select\('status_licenca, validade_licenca'\)\.eq\('id', totem\.usuario_id\);/,
  "const [rows_user]: any = await pool.query('SELECT status_licenca, validade_licenca FROM usuarios WHERE id = ?', [totem.usuario_id]);"
);

code = code.replace(
  /await supabase\.from\('totens'\)\.update\(\{ status: 'online', ultima_sincronizacao: new Date\(\)\.toISOString\(\) \}\)\.eq\('id', totem\.id\);/,
  "await pool.execute(\"UPDATE totens SET status = 'online', ultima_sincronizacao = NOW() WHERE id = ?\", [totem.id]);"
);

code = code.replace(
  /const \{ data: playlistRaw \} = await supabase\.from\('campanhas'\)\.select\('id, tipo_midia, arquivo_url, tempo_exibicao'\)[\s\S]*?\}\)/,
  `const [playlistRaw]: any = await pool.query(\`
      SELECT id, tipo_midia, arquivo_url as url_arquivo, tempo_exibicao
      FROM campanhas 
      WHERE (totem_id = ? OR totem_id IS NULL)
        AND ativo = 1 
        AND data_inicio <= ? 
        AND data_fim >= ?
    \`, [totem.id, now, now]);`
);
// Also need to clean up the mapped URL if any:
// if(playlistRaw) {
//      playlistRaw.forEach((item: any) => { item.url_arquivo = item.arquivo_url; });
//    }
code = code.replace(/if\(playlistRaw\) \{\s*playlistRaw\.forEach\(\(item: any\) => \{ item\.url_arquivo = item\.arquivo_url; \}\);\s*\}/, "");

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts for MySQL");
