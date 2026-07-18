import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, initDb } from './src/db/index.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { handleUpload } from '@vercel/blob/client';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production'
  ? (() => { console.error('CRITICAL WARNING: JWT_SECRET environment variable is missing in production! Users will be logged out on every server restart.'); return crypto.randomBytes(32).toString('hex'); })()
  : crypto.randomBytes(32).toString('hex'));

// File Upload Config
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

async function handleFileUpload(file: Express.Multer.File, allowedExtensions: string[]): Promise<string> {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Tipo de arquivo não permitido: apenas extensões ${allowedExtensions.join(', ')} são aceitas.`);
  }

  const isVercel = process.env.VERCEL === '1';
  const sanitizedOriginal = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${Date.now()}-${sanitizedOriginal}`;

  if (isVercel) {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`uploads/${filename}`, file.buffer, { access: 'public' });
      return filename;
    } else {
      throw new Error("Vercel Blob Storage is not configured. Add BLOB_READ_WRITE_TOKEN.");
    }
  } else {
    const uploadDir = path.join(process.cwd(), 'dist', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
    return filename;
  }
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'dist', 'uploads')));

let dbInitialized = false;
let dbInitPromise: Promise<void> | null = null;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    if (!dbInitPromise) {
      dbInitPromise = initDb().then(() => {
        dbInitialized = true;
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
});

// --- Auth Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.nivel !== 'admin') return res.sendStatus(403);
  next();
};

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '');
    const senha = String(req.body.senha || '');
    const db = getDb();
    
    const [rows]: any = await db.query('SELECT * FROM usuarios WHERE email = ? LIMIT 1', [email]);
    const user = rows[0];
    
    if (user && bcrypt.compareSync(senha, user.senha)) {
      const token = jwt.sign({ id: user.id.toString(), email: user.email, nivel: user.nivel, nome: user.nome }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id.toString(), email: user.email, nome: user.nome, nivel: user.nivel } });
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (err: any) {
    console.error("Login error", err);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
});

// --- Admin Routes ---
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const [users]: any = await db.query('SELECT id, nome, cpf, email, nivel, status_licenca, validade_licenca, created_at FROM usuarios');
    res.json(users.map((u: any) => ({ ...u, id: u.id.toString() })));
  } catch(err: any) { res.status(500).json({error: err.message}); }
});

app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nome, cpf, email, senha, nivel, validade_licenca } = req.body;
    const hash = bcrypt.hashSync(senha, 10);
    const db = getDb();
    
    const validadeFormatada = validade_licenca ? validade_licenca.replace('T', ' ').substring(0, 19) : null;
    
    await db.execute(
      'INSERT INTO usuarios (nome, cpf, email, senha, nivel, validade_licenca, status_licenca, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [nome, cpf, email, hash, nivel, validadeFormatada, 'ativa']
    );
    res.json({ message: 'Usuário criado com sucesso' });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: 'Erro ao criar usuário, email ou CPF já existente' });
  }
});

app.put('/api/admin/users/:id/license', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status_licenca, validade_licenca } = req.body;
    const db = getDb();
    const validadeFormatada = validade_licenca ? validade_licenca.replace('T', ' ').substring(0, 19) : null;
    await db.execute('UPDATE usuarios SET status_licenca = ?, validade_licenca = ? WHERE id = ?', [status_licenca, validadeFormatada, req.params.id]);
    res.json({ message: 'Licença atualizada' });
  } catch(err: any) { res.status(500).json({error: err.message}); }
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nome, email, senha, nivel, status_licenca, validade_licenca } = req.body;
    const db = getDb();
    const validadeFormatada = validade_licenca ? validade_licenca.replace('T', ' ').substring(0, 19) : null;
    
    if (senha && senha.trim() !== '') {
      const hash = bcrypt.hashSync(senha, 10);
      await db.execute(
        'UPDATE usuarios SET nome = ?, email = ?, senha = ?, nivel = ?, status_licenca = ?, validade_licenca = ? WHERE id = ?',
        [nome, email, hash, nivel, status_licenca, validadeFormatada, req.params.id]
      );
    } else {
      await db.execute(
        'UPDATE usuarios SET nome = ?, email = ?, nivel = ?, status_licenca = ?, validade_licenca = ? WHERE id = ?',
        [nome, email, nivel, status_licenca, validadeFormatada, req.params.id]
      );
    }
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (err: any) {
    res.status(400).json({ error: 'Erro ao atualizar usuário.' });
  }
});

app.get('/api/admin/settings', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const [rows]: any = await db.query('SELECT * FROM configuracoes_admin LIMIT 1');
    const settings = rows[0] || {};
    
    const defaultSettings = {
      nome_painel: 'VisioIndoor',
      logo_url: '',
      show_apk_banner: true,
      apk_banner_title: 'Player Android',
      apk_banner_desc: 'Baixe o APK para rodar suas playlists em TVs ou Totens.',
      apk_banner_btn_text: 'Instalar Player',
      apk_file_url: ''
    };
    
    if (settings.id) settings.id = settings.id.toString();
    if (settings.show_apk_banner !== undefined) {
      settings.show_apk_banner = Boolean(settings.show_apk_banner);
    }
    
    res.json({ ...defaultSettings, ...settings });
  } catch(err: any) { res.status(500).json({error: err.message}); }
});

app.put('/api/admin/settings', authenticateToken, requireAdmin, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'apk', maxCount: 1 }]), async (req, res) => {
  try {
    const { nome_painel, show_apk_banner, apk_banner_title, apk_banner_desc, apk_banner_btn_text } = req.body;
    let logo_url = req.body.logo_url;
    let apk_file_url = req.body.apk_file_url;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files) {
      if (files['logo'] && files['logo'][0]) logo_url = await handleFileUpload(files['logo'][0], ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
      if (files['apk'] && files['apk'][0]) apk_file_url = await handleFileUpload(files['apk'][0], ['.apk']);
    }
    
    const db = getDb();
    const [existing]: any = await db.query('SELECT id FROM configuracoes_admin LIMIT 1');
    
    const isShowBanner = show_apk_banner === 'true' ? 1 : 0;
    
    if (existing && existing.length > 0) {
      await db.execute(
        'UPDATE configuracoes_admin SET nome_painel=?, logo_url=?, show_apk_banner=?, apk_banner_title=?, apk_banner_desc=?, apk_banner_btn_text=?, apk_file_url=? WHERE id = ?',
        [nome_painel, logo_url, isShowBanner, apk_banner_title || '', apk_banner_desc || '', apk_banner_btn_text || '', apk_file_url, existing[0].id]
      );
    } else {
      await db.execute(
        'INSERT INTO configuracoes_admin (nome_painel, logo_url, show_apk_banner, apk_banner_title, apk_banner_desc, apk_banner_btn_text, apk_file_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nome_painel, logo_url, isShowBanner, apk_banner_title || '', apk_banner_desc || '', apk_banner_btn_text || '', apk_file_url]
      );
    }
    
    res.json({ message: 'Configurações salvas' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Totems Routes ---
app.get('/api/totems', authenticateToken, async (req: any, res) => {
  try {
    const db = getDb();
    
    // Set offline for totems not synced in last 2 mins
    await db.execute("UPDATE totens SET status = 'offline' WHERE ultima_sincronizacao < DATE_SUB(NOW(), INTERVAL 2 MINUTE) OR ultima_sincronizacao IS NULL");

    let query = '';
    let params: any[] = [];
    
    if (req.user.nivel === 'admin') {
      query = `SELECT t.*, u.nome as usuario_nome, u.email as usuario_email 
               FROM totens t LEFT JOIN usuarios u ON t.usuario_id = u.id`;
    } else {
      query = `SELECT * FROM totens WHERE usuario_id = ?`;
      params.push(req.user.id);
    }
    
    const [totems]: any = await db.query(query, params);
    
    const mappedTotems = totems.map((t: any) => ({
      ...t,
      id: t.id.toString(),
      data_cadastro: t.created_at
    }));
    
    res.json(mappedTotems);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/totems', authenticateToken, async (req: any, res) => {
  try {
    const { nome, device_id } = req.body;
    const db = getDb();
    await db.execute(
      "INSERT INTO totens (usuario_id, nome, device_id, status, ultima_sincronizacao) VALUES (?, ?, ?, 'offline', NULL)",
      [req.user.id, nome, device_id]
    );
    res.json({ message: 'Totem adicionado' });
  } catch (err: any) {
    res.status(400).json({ error: 'Erro ao adicionar totem, ID de dispositivo pode já existir' });
  }
});

app.put('/api/totems/:id', authenticateToken, async (req: any, res) => {
  try {
    const { nome, device_id } = req.body;
    const db = getDb();
    if (req.user.nivel === 'admin') {
      await db.execute("UPDATE totens SET nome = ?, device_id = ? WHERE id = ?", [nome, device_id, req.params.id]);
    } else {
      await db.execute("UPDATE totens SET nome = ?, device_id = ? WHERE id = ? AND usuario_id = ?", [nome, device_id, req.params.id, req.user.id]);
    }
    res.json({ message: 'Totem atualizado' });
  } catch (err: any) {
    res.status(400).json({ error: 'Erro ao atualizar totem' });
  }
});

app.delete('/api/totems/:id', authenticateToken, async (req: any, res) => {
  try {
    const db = getDb();
    if (req.user.nivel === 'admin') {
      await db.execute("DELETE FROM totens WHERE id = ?", [req.params.id]);
    } else {
      await db.execute("DELETE FROM totens WHERE id = ? AND usuario_id = ?", [req.params.id, req.user.id]);
    }
    res.json({ message: 'Totem removido' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Playlists Routes ---
app.get('/api/playlists', authenticateToken, async (req: any, res) => {
  try {
    const db = getDb();
    let query = 'SELECT * FROM campanhas';
    let params: any[] = [];
    
    if (req.user.nivel !== 'admin') {
      query += ' WHERE usuario_id = ?';
      params.push(req.user.id);
    }
    
    const [campaigns]: any = await db.query(query, params);
    res.json(campaigns.map((c: any) => {
      let url = c.arquivo_url;
      if (url && !url.startsWith('http')) {
        if (url.startsWith('/uploads/')) url = url.substring(9);
        if (url.startsWith('uploads/')) url = url.substring(8);
        url = 'https://ioiv3vkmo3gblbxw.public.blob.vercel-storage.com/uploads/' + url;
      }
      return { ...c, id: c.id.toString(), totem_id: c.totem_id ? c.totem_id.toString() : null, arquivo_url: url };
    }));
  } catch(err: any) { res.status(500).json({error: err.message}); }
});

app.post('/api/playlists', authenticateToken, upload.single('arquivo'), async (req: any, res) => {
  try {
    const { totem_id, titulo, tipo_midia, tempo_exibicao, data_inicio, data_fim, url, arquivo_url: bodyArquivoUrl } = req.body;
    let finalUrl = bodyArquivoUrl || url || '';
    if (req.file) {
      finalUrl = await handleFileUpload(req.file, ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.webm', '.avi', '.mov']);
    }
    
    const db = getDb();
    const tId = totem_id ? totem_id : null;
    const inicio = data_inicio ? data_inicio.replace('T', ' ').substring(0, 19) : null;
    const fim = data_fim ? data_fim.replace('T', ' ').substring(0, 19) : null;
    
    await db.execute(
      'INSERT INTO campanhas (usuario_id, totem_id, titulo, tipo_midia, tempo_exibicao, data_inicio, data_fim, arquivo_url, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [req.user.id, tId, titulo || '', tipo_midia || '', Number(tempo_exibicao) || 0, inicio, fim, finalUrl]
    );
    
    res.json({ message: 'Mídia adicionada' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao enviar mídia: ' + err.message });
  }
});

app.put('/api/playlists/:id', authenticateToken, upload.single('arquivo'), async (req: any, res) => {
  try {
    const { totem_id, titulo, tipo_midia, tempo_exibicao, data_inicio, data_fim, url, arquivo_url: bodyArquivoUrl } = req.body;
    let finalUrl = bodyArquivoUrl || url;
    if (req.file) {
       finalUrl = await handleFileUpload(req.file, ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.webm', '.avi', '.mov']);
    }
    
    const tId = totem_id ? totem_id : null;
    const inicio = data_inicio ? data_inicio.replace('T', ' ').substring(0, 19) : null;
    const fim = data_fim ? data_fim.replace('T', ' ').substring(0, 19) : null;
    
    const db = getDb();
    if (finalUrl !== undefined && finalUrl !== '') {
       await db.execute(
         'UPDATE campanhas SET totem_id=?, titulo=?, tipo_midia=?, tempo_exibicao=?, data_inicio=?, data_fim=?, arquivo_url=? WHERE id=? AND usuario_id=?',
         [tId, titulo||'', tipo_midia||'', Number(tempo_exibicao)||0, inicio, fim, finalUrl, req.params.id, req.user.id]
       );
    } else {
       await db.execute(
         'UPDATE campanhas SET totem_id=?, titulo=?, tipo_midia=?, tempo_exibicao=?, data_inicio=?, data_fim=? WHERE id=? AND usuario_id=?',
         [tId, titulo||'', tipo_midia||'', Number(tempo_exibicao)||0, inicio, fim, req.params.id, req.user.id]
       );
    }
    
    res.json({ message: 'Mídia atualizada' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar: ' + err.message });
  }
});

app.delete('/api/playlists/:id', authenticateToken, async (req: any, res) => {
   try {
     const db = getDb();
     await db.execute('DELETE FROM campanhas WHERE id = ? AND usuario_id = ?', [req.params.id, req.user.id]);
     res.json({ message: 'Midia deletada' });
   } catch(err: any) { res.status(500).json({error: err.message}); }
});

// --- Vercel Blob Configuration and Upload signature routes ---
app.get('/api/config', (req, res) => {
  res.json({
    useBlob: !!process.env.BLOB_READ_WRITE_TOKEN
  });
});

app.post('/api/blob/upload', async (req, res) => {
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
            'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
            'application/vnd.android.package-archive'
          ],
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Vercel Blob upload completed:', blob.url);
      },
    });
    res.json(jsonResponse);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- TV Box / Totem Endpoint API ---
app.all(['/api.php', '/api/get_playlist.php'], async (req, res) => {
  try {
    const rawDeviceId = req.query.device_id || req.body?.device_id;
    if (!rawDeviceId) {
      return res.json({ erro: "Identificador do dispositivo nao fornecido." });
    }

    const deviceIdClean = String(rawDeviceId).trim();
    const db = getDb();
    
    const [totens]: any = await db.query('SELECT * FROM totens WHERE device_id = ? LIMIT 1', [deviceIdClean]);
    const totem = totens[0];
    
    if (!totem) {
      return res.json({ 
          erro: "Dispositivo nao autorizado.",
          device_id: deviceIdClean,
          mensagem: "Cadastre este ID de dispositivo no seu painel de controle."
      });
    }

    const [usuarios]: any = await db.query('SELECT * FROM usuarios WHERE id = ? LIMIT 1', [totem.usuario_id]);
    const user = usuarios[0];
    
    if (!user || user.status_licenca !== 'ativa' || new Date(user.validade_licenca) < new Date()) {
       return res.json({
           erro: "Licenca expirada ou inativa.",
           mensagem: "A licenca desta agencia expirou. Contate o administrador."
       });
    }

    await db.execute('UPDATE totens SET status = ?, ultima_sincronizacao = NOW() WHERE id = ?', ['online', totem.id]);

    const hostUrl = process.env.APP_URL || `${req.headers['x-forwarded-proto'] || req.protocol}://${req.get('host')}`;

    // Get active playlists for this totem or global (totem_id IS NULL)
    // Considering dates (if data_inicio/data_fim exist)
    const [playlistRaw]: any = await db.query(`
      SELECT id, tipo_midia, arquivo_url, tempo_exibicao 
      FROM campanhas 
      WHERE (totem_id = ? OR totem_id IS NULL) 
        AND ativo = 1 
        AND (data_inicio IS NULL OR data_inicio <= NOW())
        AND (data_fim IS NULL OR data_fim >= NOW())
    `, [totem.id]);
    
    const playlist = playlistRaw.map((item: any) => {
      let url = item.arquivo_url;
      if (url && !url.startsWith('http')) {
        if (url.startsWith('/uploads/')) url = url.substring(9);
        if (url.startsWith('uploads/')) url = url.substring(8);
        url = 'https://ioiv3vkmo3gblbxw.public.blob.vercel-storage.com/uploads/' + url;
      }
      return {
        id: item.id.toString(),
        tipo_midia: item.tipo_midia,
        url_arquivo: url,
        tempo_exibicao: item.tempo_exibicao
      };
    });

    res.json({
      totem_id: deviceIdClean,
      playlist
    });
  } catch (err: any) {
    res.json({ erro: "Erro interno no servidor.", detalhe: err.message });
  }
});


// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  import('vite').then(({ createServer: createViteServer }) => {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then(vite => {
      app.use(vite.middlewares);
    });
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*all', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (process.env.VERCEL !== '1') {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
