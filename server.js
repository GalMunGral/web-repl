const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

py = spawn('python3', ['kernel.py']);
py.stdout.setEncoding('utf-8');

const server = http.createServer((req, res) => {
  let match;
  req.url += (req.url === '/' ? 'index.html' : '');
  let filePath = __dirname + req.url;
  if (match = filePath.match(/\w+.(html|js|css)$/)) {
    if (!fs.existsSync(filePath)) {
      console.log('File not found');
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader('Content-Type', `text/${match[1]};;charset=UTF-8`);
    fs.createReadStream(filePath).pipe(res);
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  req.setEncoding('utf-8');
  req.on('data', (input) => {
    py.stdout.on('data', (data) => {
      py.stdout.removeAllListeners('data');
      res.end(data + '\n');
    })
    py.stdin.write(input+'\n');
  });
});

server.listen(3004, () => {
  console.log('Listening on http://127.0.0.1:3004')
});
