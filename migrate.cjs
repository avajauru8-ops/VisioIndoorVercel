const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/import pool, \{ initDb \} from '\.\/src\/db\/index\.js';/g, "import db, { initDb } from './src/db/index.js';");

// SELECT queries
content = content.replace(/const \[([a-zA-Z0-9_]+)\]: any = await pool\.query\((.*?),\s*(\[.*?\])\);/gs, "const { rows: $1 } = await db.execute({ sql: $2, args: $3 });");
content = content.replace(/const \[([a-zA-Z0-9_]+)\] = await pool\.query\((.*?),\s*(\[.*?\])\);/gs, "const { rows: $1 } = await db.execute({ sql: $2, args: $3 });");
content = content.replace(/const \[([a-zA-Z0-9_]+)\]: any = await pool\.query\(([\s\S]*?)\);/gs, "const { rows: $1 } = await db.execute($2);");

// EXECUTE with results (like inserts)
content = content.replace(/const \[([a-zA-Z0-9_]+)\]: any = await pool\.execute\((.*?),\s*(\[.*?\])\);/gs, "const $1 = await db.execute({ sql: $2, args: $3 });");
content = content.replace(/const \[([a-zA-Z0-9_]+)\] = await pool\.execute\((.*?),\s*(\[.*?\])\);/gs, "const $1 = await db.execute({ sql: $2, args: $3 });");

// EXECUTE without result assignment
content = content.replace(/await pool\.execute\((.*?),\s*(\[.*?\])\);/gs, "await db.execute({ sql: $1, args: $2 });");
content = content.replace(/await pool\.execute\((.*?)\);/gs, "await db.execute($1);");

// Fix insertId -> lastInsertRowid
content = content.replace(/\.insertId/g, ".lastInsertRowid");

fs.writeFileSync('server.ts', content);
