const http = require('http');
const express = require('express');
const Server = require('socket.io');
const duoHandler = require('./backend/duo');
const multiHandler = require('./backend/multi');

const app = express();
const server = http.createServer(app);
const io = Server(server);


io.of('/duo').on('connection', duoHandler);
io.of('/multi').on('connection', multiHandler);

app.use(express.static(__dirname));
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

server.listen(3001, '0.0.0.0', () => {
  console.log(`Listening on 0.0.0.0:3001`);
});

