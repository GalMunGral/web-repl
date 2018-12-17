const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');

py = spawn('python3', ['kernel.py']);
py.stdout.setEncoding('utf-8');

const server = http.createServer((req, res) => {
  let match;
  req.url += (req.url === '/') ? 'index.html' : '';
  if (match = req.url.match(/\w+.(html|js|css)$/)) {
    let path = __dirname + req.url;
    if (!fs.existsSync(path)) return;
    res.setHeader('Content-Type', `text/${match[1]}`);
    fs.createReadStream(path).pipe(res);
  }

  req.setEncoding('utf-8');
  req.on('data', (input) => {
    py.stdout.on('data', (data) => {
      py.stdout.removeAllListeners('data');
      res.end(data + '\n');
    })
    py.stdin.write(input+'\n');
  });
});

server.listen(8080, () => {
  console.log('Listening on 8080!')
});
