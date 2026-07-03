const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  for (const line of fs.readFileSync(envLocalPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Aviso: NEXT_PUBLIC_SUPABASE_URL/ANON_KEY não configuradas. O painel será publicado sem persistência.');
}

let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
html = html.split('__SUPABASE_URL__').join(SUPABASE_URL);
html = html.split('__SUPABASE_ANON_KEY__').join(SUPABASE_ANON_KEY);

fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), html);
console.log('Build concluído: dist/index.html');
