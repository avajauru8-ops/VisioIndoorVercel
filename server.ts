import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDb, initDb } from './src/db/index.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

// Helpers
const mapId = (doc: any) => doc ? { ...doc, id: doc._id.toString() } : null;
const mapIds = (docs: any[]) => docs.map(mapId);

// File Upload Config
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

async function handleFileUpload(file: Express.Multer.File): Promise<string> {
  const isVercel = process.env.VERCEL === '1';
  if (isVercel) {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`uploads/${Date.now()}-${file.originalname}`, file.buffer, { access: 'public' });
      return blob.url;
    } else {
      throw new Error("Vercel Blob Storage is not configured. Add BLOB_READ_WRITE_TOKEN.");
    }
  } else {
    const uploadDir = path.join(process.cwd(), 'dist', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filename = `${Date.now()}-${file.originalname}`;
    fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
    return `/uploads/${filename}`;
  }
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    const { email, senha } = req.body;
    const db = getDb();
    const user = await db.collection('usuarios').findOne({ email });
    
    if (user && bcrypt.compareSync(senha, user.senha)) {
      const token = jwt.sign({ id: user._id.toString(), email: user.email, nivel: user.nivel, nome: user.nome }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user._id.toString(), email: user.email, nome: user.nome, nivel: user.nivel } });
    } else {
      res.status(401).json({ error: 'Credenciais invalidas' });
    }
  } catch (err: any) {
    console.error("Login error", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// --- Admin Routes ---
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  const db = getDb();
  const users = await db.collection('usuarios').find().project({ senha: 0 }).toArray();
  res.json(mapIds(users));
});

app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nome, cpf, email, senha, nivel, validade_licenca } = req.body;
    const hash = bcrypt.hashSync(senha, 10);
    const db = getDb();
    await db.collection('usuarios').insertOne({
      nome, cpf, email, senha: hash, nivel, validade_licenca, status_licenca: 'ativa', created_at: new Date()
    });
    res.json({ message: 'Usuário criado com sucesso' });
  } catch (err: any) {
    res.status(400).json({ error: 'Erro ao criar usuário, email ou CPF já existente' });
  }
});

app.put('/api/admin/users/:id/license', authenticateToken, requireAdmin, async (req, res) => {
  const { status_licenca, validade_licenca } = req.body;
  const db = getDb();
  await db.collection('usuarios').updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { status_licenca, validade_licenca } }
  );
  res.json({ message: 'Licença atualizada' });
});

app.get('/api/admin/settings', authenticateToken, async (req, res) => {
  const db = getDb();
  const settings = await db.collection('configuracoes_admin').findOne({});
  res.json(mapId(settings) || { nome_painel: 'VisioIndoor', logo_url: '' });
});

app.put('/api/admin/settings', authenticateToken, requireAdmin, upload.single('logo'), async (req, res) => {
  try {
    const { nome_painel } = req.body;
    let logo_url = req.body.logo_url;
    if (req.file) {
      logo_url = await handleFileUpload(req.file);
    }
    const db = getDb();
    await db.collection('configuracoes_admin').updateOne({}, { $set: { nome_painel, logo_url } }, { upsert: true });
    res.json({ message: 'Configurações salvas' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Agency Routes ---
app.get('/api/agency/profile', authenticateToken, async (req: any, res) => {
  const db = getDb();
  const profile = await db.collection('agencia').findOne({ usuario_id: req.user.id });
  res.json(mapId(profile) || {});
});

app.post('/api/agency/profile', authenticateToken, upload.single('logo'), async (req: any, res) => {
  try {
    const { nome, cpf_cnpj, endereco, cidade, estado, whatsapp, cidades_atuacao } = req.body;
    let logo_url = req.body.logo_url;
    if (req.file) {
      logo_url = await handleFileUpload(req.file);
    }
    
    const db = getDb();
    await db.collection('agencia').updateOne(
      { usuario_id: req.user.id },
      { $set: { nome: nome||'', cpf_cnpj: cpf_cnpj||'', endereco: endereco||null, cidade: cidade||null, estado: estado||null, whatsapp: whatsapp||null, cidades_atuacao: cidades_atuacao||null, logo_url: logo_url||null } },
      { upsert: true }
    );
    res.json({ message: 'Perfil salvo' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Totems Routes ---
app.get('/api/totems', authenticateToken, async (req: any, res) => {
  try {
    const db = getDb();
    const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
    await db.collection('totens').updateMany(
      { $or: [ { ultima_sincronizacao: { $lt: twoMinsAgo } }, { ultima_sincronizacao: null } ] },
      { $set: { status: 'offline' } }
    );

    let totems;
    if (req.user.nivel === 'admin') {
      totems = await db.collection('totens').find().toArray();
    } else {
      totems = await db.collection('totens').find({ usuario_id: req.user.id }).toArray();
    }
    res.json(mapIds(totems));
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/totems', authenticateToken, async (req: any, res) => {
  try {
    const { nome, device_id } = req.body;
    const db = getDb();
    await db.collection('totens').insertOne({
       usuario_id: req.user.id, nome, device_id, status: 'offline', ultima_sincronizacao: null
    });
    res.json({ message: 'Totem adicionado' });
  } catch (err: any) {
    res.status(400).json({ error: 'Erro ao adicionar totem, ID de dispositivo pode já existir' });
  }
});

app.delete('/api/totems/:id', authenticateToken, async (req: any, res) => {
  const db = getDb();
  await db.collection('totens').deleteOne({ _id: new ObjectId(req.params.id), usuario_id: req.user.id });
  res.json({ message: 'Totem removido' });
});

// --- Playlists Routes ---
app.get('/api/playlists', authenticateToken, async (req: any, res) => {
  const db = getDb();
  let campaigns;
  if (req.user.nivel === 'admin') {
    campaigns = await db.collection('campanhas').find().toArray();
  } else {
    campaigns = await db.collection('campanhas').find({ usuario_id: req.user.id }).toArray();
  }
  res.json(mapIds(campaigns));
});

app.post('/api/playlists', authenticateToken, upload.single('arquivo'), async (req: any, res) => {
  try {
    const { totem_id, titulo, tipo_midia, tempo_exibicao, data_inicio, data_fim, url, arquivo_url: bodyArquivoUrl } = req.body;
    let finalUrl = bodyArquivoUrl || url || '';
    if (req.file) {
      finalUrl = await handleFileUpload(req.file);
    }
    
    const db = getDb();
    await db.collection('campanhas').insertOne({
      usuario_id: req.user.id,
      totem_id: totem_id ? totem_id : null,
      titulo: titulo || '',
      tipo_midia: tipo_midia || '',
      tempo_exibicao: Number(tempo_exibicao) || 0,
      data_inicio: data_inicio || '',
      data_fim: data_fim || '',
      arquivo_url: finalUrl,
      ativo: 1
    });
    
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
       finalUrl = await handleFileUpload(req.file);
    }
    
    const updateFields: any = {
       totem_id: totem_id ? totem_id : null,
       titulo: titulo || '',
       tipo_midia: tipo_midia || '',
       tempo_exibicao: Number(tempo_exibicao) || 0,
       data_inicio: data_inicio || '',
       data_fim: data_fim || ''
    };
    
    if (finalUrl !== undefined && finalUrl !== '') {
       updateFields.arquivo_url = finalUrl;
    }
    
    const db = getDb();
    await db.collection('campanhas').updateOne(
       { _id: new ObjectId(req.params.id), usuario_id: req.user.id },
       { $set: updateFields }
    );
    
    res.json({ message: 'Mídia atualizada' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar: ' + err.message });
  }
});

app.delete('/api/playlists/:id', authenticateToken, async (req: any, res) => {
   const db = getDb();
   await db.collection('campanhas').deleteOne({ _id: new ObjectId(req.params.id), usuario_id: req.user.id });
   res.json({ message: 'Midia deletada' });
});

// --- TV Box / Totem Endpoint API ---
app.get(['/api.php', '/api/get_playlist.php'], async (req, res) => {
  try {
    const { device_id } = req.query;
    if (!device_id) {
      return res.json({ erro: "Identificador do dispositivo nao fornecido." });
    }

    const db = getDb();
    const totem = await db.collection('totens').findOne({ device_id: String(device_id) });
    
    if (!totem) {
      return res.json({ 
          erro: "Dispositivo nao autorizado.",
          device_id,
          mensagem: "Cadastre este ID de dispositivo no seu painel de controle."
      });
    }

    const user = await db.collection('usuarios').findOne({ _id: new ObjectId(totem.usuario_id) });
    if (!user || user.status_licenca !== 'ativa' || new Date(user.validade_licenca) < new Date()) {
       return res.json({
           erro: "Licenca expirada ou inativa.",
           mensagem: "A licenca desta agencia expirou. Contate o administrador."
       });
    }

    await db.collection('totens').updateOne(
       { _id: totem._id },
       { $set: { status: 'online', ultima_sincronizacao: new Date() } }
    );

    const now = new Date().toISOString();
    const hostUrl = process.env.APP_URL || `${req.headers['x-forwarded-proto'] || req.protocol}://${req.get('host')}`;

    const playlistRaw = await db.collection('campanhas').find({
      $or: [ { totem_id: totem._id.toString() }, { totem_id: null } ],
      ativo: 1,
      data_inicio: { $lte: now },
      data_fim: { $gte: now }
    }).project({ _id: 1, tipo_midia: 1, arquivo_url: 1, tempo_exibicao: 1 }).toArray();
    
    const playlist = playlistRaw.map((item: any) => {
      let url = item.arquivo_url;
      if (url && url.startsWith('/uploads/')) {
        url = hostUrl + url;
      }
      return {
        id: item._id.toString(),
        tipo_midia: item.tipo_midia,
        url_arquivo: url,
        tempo_exibicao: item.tempo_exibicao
      };
    });

    res.json({
      totem_id: device_id,
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

// Only start the server if we're not in a serverless environment (like Vercel)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
