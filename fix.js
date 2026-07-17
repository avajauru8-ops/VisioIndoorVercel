const fs = require('fs');
const glob = require('child_process').execSync('find src -type f -name "*.tsx" -o -name "*.ts"').toString().split('\n').filter(Boolean);
glob.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed', file);
  }
});
