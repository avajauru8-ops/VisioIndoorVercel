const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldBlock = /app\.get\('\/api\.php', async \(req, res\) => \{[\s\S]*?res\.json\(\{\s*totem_id: totem\.id,[\s\S]*?playlist\s*\}\);\s*\}\);/m;

const newBlock = `app.get(['/api.php', '/api/get_playlist.php'], async (req, res) => {
    const { device_id } = req.query;
    if (!device_id) {
      return res.json({ erro: "Identificador do dispositivo nao fornecido." });
    }

    // Validate device
    const { rows: rows_totem } = await db.execute({ sql: 'SELECT * FROM totens WHERE device_id = ?', args: [device_id as string] });
    const totem = rows_totem[0];
    if (!totem) {
      return res.json({ 
          erro: "Dispositivo nao autorizado.",
          device_id,
          mensagem: "Cadastre este ID de dispositivo no seu painel de controle."
      });
    }

    // Check user license
    const { rows: rows_user } = await db.execute({ sql: 'SELECT status_licenca, validade_licenca FROM usuarios WHERE id = ?', args: [totem.usuario_id] });
    const user = rows_user[0];
    if (!user || user.status_licenca !== 'ativa' || new Date(user.validade_licenca) < new Date()) {
       return res.json({ erro: "Licença expirada ou inativa" });
    }

    // Update totem status to online
    await db.execute({ sql: "UPDATE totens SET status = 'online', ultima_sincronizacao = CURRENT_TIMESTAMP WHERE id = ?", args: [totem.id] });

    // Get active playlist for this totem
    const now = new Date().toISOString();
    
    // In Vercel, req.protocol might be http, but we can trust APP_URL or headers
    const hostUrl = process.env.APP_URL || \`\${req.headers['x-forwarded-proto'] || req.protocol}://\${req.get('host')}\`;

    const { rows: playlistRaw } = await db.execute({ sql: \`
      SELECT id, tipo_midia, arquivo_url as url_arquivo, tempo_exibicao
      FROM campanhas 
      WHERE (totem_id = ? OR totem_id IS NULL)
        AND ativo = 1 
        AND data_inicio <= ? 
        AND data_fim >= ?
    \`, args: [totem.id, now, now] });
    
    const playlist = playlistRaw.map((item: any) => {
      let url = item.url_arquivo;
      if (url && url.startsWith('/uploads/')) {
        url = hostUrl + url;
      }
      return {
        ...item,
        url_arquivo: url
      };
    });

    res.json({
      totem_id: device_id,
      playlist
    });
  });`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('server.ts', content);
