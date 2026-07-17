const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace db import with supabase
code = code.replace(/import db, \{ initDb \} from '\.\/src\/db\/index\.js';/, "import supabase from './src/db/index.js';");

// Remove dbInitialized logic
code = code.replace(/let dbInitialized = false;[\s\S]*?next\(\);\n\}\);/, "");

// 1. Auth Login
code = code.replace(
  /const \{ rows: rows_user \} = await db\.execute\(\{ sql: 'SELECT \* FROM usuarios WHERE email = \?', args: \[email\] \}\);/,
  "const { data: rows_user, error } = await supabase.from('usuarios').select('*').eq('email', email);"
);

// 2. Admin Users Get
code = code.replace(
  /const \{ rows: users \} = await db\.execute\(\{ sql: 'SELECT id, nome, cpf, email, nivel, status_licenca, validade_licenca, created_at FROM usuarios', args: \[\] \}\);/,
  "const { data: users } = await supabase.from('usuarios').select('id, nome, cpf, email, nivel, status_licenca, validade_licenca, created_at');"
);

// 3. Admin Users Post
code = code.replace(
  /const result = await db\.execute\(\{ sql: `\s*INSERT INTO usuarios \(nome, cpf, email, senha, nivel, validade_licenca\)\s*VALUES \(\?, \?, \?, \?, \?, \?\)\s*`, args: \[nome, cpf, email, hash, nivel, validade_licenca\] \}\);\s*res\.json\(\{ id: Number\(result\.lastInsertRowid\), message: 'Usuário criado com sucesso' \}\);/,
  "const { data, error } = await supabase.from('usuarios').insert({ nome, cpf, email, senha: hash, nivel, validade_licenca }).select();\n      if (error) throw error;\n      res.json({ id: data[0].id, message: 'Usuário criado com sucesso' });"
);

// 4. Admin Users License Update
code = code.replace(
  /await db\.execute\(\{ sql: 'UPDATE usuarios SET status_licenca = \?, validade_licenca = \? WHERE id = \?', args: \[status_licenca, validade_licenca, Number\(req\.params\.id\)] \}\);/,
  "await supabase.from('usuarios').update({ status_licenca, validade_licenca }).eq('id', Number(req.params.id));"
);

// 5. Admin Settings Get
code = code.replace(
  /const \{ rows: rows_settings \} = await db\.execute\(\{ sql: 'SELECT \* FROM configuracoes_admin WHERE id = 1', args: \[\] \}\);/,
  "const { data: rows_settings } = await supabase.from('configuracoes_admin').select('*').eq('id', 1);"
);

// 6. Admin Settings Update
code = code.replace(
  /await db\.execute\(\{ sql: 'UPDATE configuracoes_admin SET nome_painel = \?, logo_url = \? WHERE id = 1', args: \[nome_painel, logo_url\] \}\);/,
  "await supabase.from('configuracoes_admin').update({ nome_painel, logo_url }).eq('id', 1);"
);

// 7. Agency Profile Get
code = code.replace(
  /const \{ rows: rows_profile \} = await db\.execute\(\{ sql: 'SELECT \* FROM agencia WHERE usuario_id = \?', args: \[req\.user\.id\] \}\);/,
  "const { data: rows_profile } = await supabase.from('agencia').select('*').eq('usuario_id', req.user.id);"
);

// 8. Agency Profile Post
code = code.replace(
  /const \{ rows: rows_existing \} = await db\.execute\(\{ sql: 'SELECT id FROM agencia WHERE usuario_id = \?', args: \[req\.user\.id\] \}\);/,
  "const { data: rows_existing } = await supabase.from('agencia').select('id').eq('usuario_id', req.user.id);"
);
code = code.replace(
  /await db\.execute\(\{ sql: `\s*UPDATE agencia SET nome = \?, cpf_cnpj = \?, endereco = \?, cidade = \?, estado = \?, whatsapp = \?, cidades_atuacao = \?, logo_url = \?\s*WHERE usuario_id = \?\s*`, args: \[nome \|\| '', cpf_cnpj \|\| '', endereco \|\| null, cidade \|\| null, estado \|\| null, whatsapp \|\| null, cidades_atuacao \|\| null, logo_url \|\| null, req\.user\.id\] \}\);/,
  "await supabase.from('agencia').update({ nome: nome||'', cpf_cnpj: cpf_cnpj||'', endereco, cidade, estado, whatsapp, cidades_atuacao, logo_url }).eq('usuario_id', req.user.id);"
);
code = code.replace(
  /await db\.execute\(\{ sql: `\s*INSERT INTO agencia \(usuario_id, nome, cpf_cnpj, endereco, cidade, estado, whatsapp, cidades_atuacao, logo_url\)\s*VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?\)\s*`, args: \[req\.user\.id, nome \|\| '', cpf_cnpj \|\| '', endereco \|\| null, cidade \|\| null, estado \|\| null, whatsapp \|\| null, cidades_atuacao \|\| null, logo_url \|\| null\] \}\);/,
  "await supabase.from('agencia').insert({ usuario_id: req.user.id, nome: nome||'', cpf_cnpj: cpf_cnpj||'', endereco, cidade, estado, whatsapp, cidades_atuacao, logo_url });"
);

// 9. Totems Get
code = code.replace(
  /\/\/ Check and update offline status for totems that haven't synced in 2 minutes[\s\S]*?totems = rows;\s*\}/,
  `// Update offline status
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    await supabase.from('totens').update({ status: 'offline' }).lt('ultima_sincronizacao', twoMinutesAgo);
    await supabase.from('totens').update({ status: 'offline' }).is('ultima_sincronizacao', null);

    let totems;
    if (req.user.nivel === 'admin') {
      const { data } = await supabase.from('totens').select('*');
      totems = data;
    } else {
      const { data } = await supabase.from('totens').select('*').eq('usuario_id', req.user.id);
      totems = data;
    }`
);

// 10. Totems Post
code = code.replace(
  /await db\.execute\(\{ sql: 'INSERT INTO totens \(usuario_id, nome, device_id\) VALUES \(\?, \?, \?\)', args: \[req\.user\.id, nome, device_id\] \}\);/,
  "const { error } = await supabase.from('totens').insert({ usuario_id: req.user.id, nome, device_id }); if (error) throw error;"
);

// 11. Totems Delete
code = code.replace(
  /await db\.execute\(\{ sql: 'DELETE FROM totens WHERE id = \? AND usuario_id = \?', args: \[Number\(req\.params\.id\), req\.user\.id\] \}\);/,
  "await supabase.from('totens').delete().eq('id', Number(req.params.id)).eq('usuario_id', req.user.id);"
);

// 12. Playlists Get
code = code.replace(
  /const \{ rows: campaigns \} = await db\.execute\(\{ sql: 'SELECT \* FROM campanhas WHERE usuario_id = \?', args: \[req\.user\.id\] \}\);/,
  "const { data: campaigns } = await supabase.from('campanhas').select('*').eq('usuario_id', req.user.id);"
);

// 13. Playlists Post
code = code.replace(
  /await db\.execute\(\{ sql: `\s*INSERT INTO campanhas \(usuario_id, totem_id, titulo, tipo_midia, tempo_exibicao, data_inicio, data_fim, arquivo_url\)\s*VALUES \(\?, \?, \?, \?, \?, \?, \?, \?\)\s*`, args: \[req\.user\.id, totem_id \? Number\(totem_id\) : null, titulo \|\| '', tipo_midia \|\| '', Number\(tempo_exibicao\) \|\| 0, data_inicio \|\| '', data_fim \|\| '', arquivo_url \|\| ''\] \}\);/,
  "await supabase.from('campanhas').insert({ usuario_id: req.user.id, totem_id: totem_id ? Number(totem_id) : null, titulo: titulo || '', tipo_midia: tipo_midia || '', tempo_exibicao: Number(tempo_exibicao) || 0, data_inicio: data_inicio || '', data_fim: data_fim || '', arquivo_url: arquivo_url || '' });"
);

// 14. Playlists Delete
code = code.replace(
  /await db\.execute\(\{ sql: 'DELETE FROM campanhas WHERE id = \? AND usuario_id = \?', args: \[Number\(req\.params\.id\), req\.user\.id\] \}\);/,
  "await supabase.from('campanhas').delete().eq('id', Number(req.params.id)).eq('usuario_id', req.user.id);"
);

// 15. API PHP Validations
code = code.replace(
  /const \{ rows: rows_totem \} = await db\.execute\(\{ sql: 'SELECT \* FROM totens WHERE device_id = \?', args: \[device_id as string\] \}\);/,
  "const { data: rows_totem } = await supabase.from('totens').select('*').eq('device_id', device_id as string);"
);

code = code.replace(
  /const \{ rows: rows_user \} = await db\.execute\(\{ sql: 'SELECT status_licenca, validade_licenca FROM usuarios WHERE id = \?', args: \[totem\.usuario_id\] \}\);/,
  "const { data: rows_user } = await supabase.from('usuarios').select('status_licenca, validade_licenca').eq('id', totem.usuario_id);"
);

code = code.replace(
  /await db\.execute\(\{ sql: "UPDATE totens SET status = 'online', ultima_sincronizacao = CURRENT_TIMESTAMP WHERE id = \?", args: \[totem\.id\] \}\);/,
  "await supabase.from('totens').update({ status: 'online', ultima_sincronizacao: new Date().toISOString() }).eq('id', totem.id);"
);

code = code.replace(
  /const \{ rows: playlistRaw \} = await db\.execute\(\{ sql: `\s*SELECT id, tipo_midia, arquivo_url as url_arquivo, tempo_exibicao\s*FROM campanhas \s*WHERE \(totem_id = \? OR totem_id IS NULL\)\s*AND ativo = 1 \s*AND data_inicio <= \? \s*AND data_fim >= \?\s*`, args: \[totem\.id, now, now\] \}\);/,
  `const { data: playlistRaw } = await supabase.from('campanhas').select('id, tipo_midia, arquivo_url, tempo_exibicao')
      .or(\`totem_id.eq.\${totem.id},totem_id.is.null\`)
      .eq('ativo', 1)
      .lte('data_inicio', now)
      .gte('data_fim', now);
    
    // Map arquivo_url to url_arquivo as expected by the mobile app
    if(playlistRaw) {
      playlistRaw.forEach((item: any) => { item.url_arquivo = item.arquivo_url; });
    }`
);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
