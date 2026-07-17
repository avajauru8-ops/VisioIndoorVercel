const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Remove the global initDb call
content = content.replace(/initDb\(\)\.then\(\(\) => \{[\s\S]*?\}\)\.catch\(err => \{[\s\S]*?\}\);/g, '');

// Add a middleware to ensure initDb is called
const middleware = `
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
});
`;

content = content.replace(/const app = express\(\);/, 'const app = express();\n' + middleware);

fs.writeFileSync('server.ts', content);
