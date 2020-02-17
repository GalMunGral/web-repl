const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('.'));

peers = [null, null];
i = 0;
const getOtherPeer = (s) => s == peers[0] ? peers[1] : peers[0];

io.on('connection', function(socket){
    if (peers[i]) peers[i].close();
    peers[i] = socket;
    i = (i + 1) % 2;
    socket.on('sendOffer', (description) => {
        socket.emit('yo', 'aaa');
        getOtherPeer(socket).emit('offer', description);
    });
    socket.on('sendAnswer', (description) => {
        getOtherPeer(socket).emit('answer', description);
    });
    socket.on('addIceCandidate', (candidate) => {
        getOtherPeer(socket).emit('candidate', candidate);
    });
    socket.on('hangup', candidate => {
        getOtherPeer(socket).emit('hangup');
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});