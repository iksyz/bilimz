const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  if (file.includes('middleware.ts')) return;
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('runtime = "edge"')) {
    content = content.replace(/export const runtime = "edge";?\r?\n?/g, '');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
