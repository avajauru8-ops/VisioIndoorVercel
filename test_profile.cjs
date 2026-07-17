const { createClient } = require('@libsql/client');
const db = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN
});

db.execute({
  sql: "SELECT * FROM agencia",
  args: []
}).then(console.log).catch(console.error);
