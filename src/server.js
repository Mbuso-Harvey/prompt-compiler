const http = require('http');
const fs = require('fs');
const path = require('path');
const { PromptCompiler } = require('./compiler');

const PORT = process.env.PORT || 3000;
const compiler = new PromptCompiler();

const server = http.createServer(async (req, res) => {
  // Static file serving
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const filePath = path.join(__dirname, '..', 'public', 'index.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading application');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
    return;
  }

  // API Route: /api/compile
  if (req.method === 'POST' && req.url === '/api/compile') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const rawText = payload.raw_text || '';
        const result = await compiler.compile(rawText);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🚀 Prompt Compiler App running at http://localhost:${PORT}`);
});
