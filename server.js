const fs = require('fs');
const path = require('path');
const http = require('http');
const Server = require('socket.io');
const { spawn } = require('child_process');

// py = spawn('python3', ['kernel.py']);
// py.stdout.setEncoding('utf-8');


const channels = {};

const server = http.createServer((req, res) => {
  let match;
  if (req.url === '/') req.url += 'index.html';
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
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
});

const io = new Server(server);
function subscribe(socket, channelId) {
  if (!(channelId in channels)) {
    channels[channelId] = {
      instance: spawn('python3', ['kernel.py']),
      listeners: new Set()
    };
    channels[channelId].instance.stdout.setEncoding('utf-8');
  }
  if (socket._channelId in channels) {
    channels[socket._channelId].listeners.delete(socket);
  }
  channels[channelId].listeners.add(socket);
  socket._channelId = channelId;
  socket.emit('info', `Listening to channel ${channelId}.`);
  socket.emit('set-channel', channelId);
}
io.on('connection', socket => {
  socket.on('subscribe', channelId => {
    subscribe(socket, channelId);
  })
  socket.on('message', ({ channelId, input }) => {
    subscribe(socket, channelId);
    const py = channels[channelId].instance;
    py.stdout.on('data', (output) => {
      output += '\n'
      py.stdout.removeAllListeners('data');
      channels[channelId].listeners.forEach(s => {
        s.emit('message', {
          channelId,
          input: s === socket ? input : null,
          output
        });
      })
    })
    py.stdin.write(input+'\n');
  });
  
  socket.on('disconnect', () => {
    if (socket._channelId in channels) {
      channels[socket._channelId].listeners.delete(socket);
    }
  });
});

server.listen(3001, () => {
  console.log(`Listening on 3000`);
});
