const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/varad/Desktop/LiveLegalAI/frontend/src';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(dir);
const VITE_INJECT = 'import.meta.env.VITE_BACKEND_URL || "https://livelegal-backend.up.railway.app"';

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace fetch('https://livelegal-backend...') with fetch((import.meta.env.VITE_BACKEND_URL || "...") + '...')
  content = content.replace(/'https:\/\/livelegal-backend\.up\.railway\.app([^']*)'/g, `(${VITE_INJECT}) + '$1'`);
  
  // Replace fetch(`https://livelegal-backend...`) with fetch(`${import.meta.env.VITE_BACKEND_URL || "..."}...`)
  content = content.replace(/`https:\/\/livelegal-backend\.up\.railway\.app([^`]*)`/g, `\`\${${VITE_INJECT}}$1\``);
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
