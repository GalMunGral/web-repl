const { spawn } = require('child_process');
const channels = {};

function getOtherPeer(s, channelId) {
  const channel = channels[channelId];
  if (!channel) return null;
  if (s == channel.peer1) {
    return channel.peer2;
  } else if (s == channel.peer2) {
    return channel.peer1;
  }
  return null
}

function connect(socket, channelId) {
  if (channelId == -1) return;
  if (!(channelId in channels)) {
    const py = spawn('python3', ['kernel.py'])
    channels[channelId] = {
      instance: py,
      peer1: null,
      peer2: null,
      last: { from: '', input: '' }
    };
    py.stdout.setEncoding('utf-8');
    py.stdout.on('data', (output) => {
      output += '\n'
      const c = channels[channelId];
      [c.peer1, c.peer2].forEach(s => {
        if (!s) return;
        s.emit('message', {
          channelId,
          senderIp: c.last.from,
          input: c.last.input,
          output
        });
      })
    });
  }
  const newChannel = channels[channelId];
  if (socket == newChannel.peer1 || socket == newChannel.peer2) return;
  if (newChannel.peer1 && newChannel.peer2) {
    socket.emit('warning', 'Room full!');
    return;
  }
  if (socket._channelId in channels) {
    const prevChannel = channels[socket._channelId]
    if (socket == prevChannel.peer1) prevChannel.peer1 = null;
    else if (socket == prevChannel.peer2) prevChannel.peer2 = null;
  }
  if (newChannel.peer1) {
    newChannel.peer2 = socket;
  } else {
    newChannel.peer1 = socket;
  }
  socket._channelId = channelId;
  socket.emit('set-channel', channelId);
  socket.emit('joined');
}

function sendMessage(socket, channelId, input) {
  if (!(channelId in channels)) throw 'You must join the room first!';
  const channel = channels[channelId];
  channel.last = { from: socket.handshake.address, input };
  channel.instance.stdin.write(input+'\n');
}

function handleConnection(socket) {
  // Text
  socket.on('ready', (channelId) => {
    connect(socket, channelId);
  })
  socket.on('message', ({ channelId, input }) => {
    try {
      sendMessage(socket, channelId, input)
    } catch(e) {
      socket.emit('warning', e);
    }
  });
  socket.on('disconnect', () => {
    if (socket._channelId in channels) {
      const c = channels[socket._channelId];
      if (c.peer1 == socket) {
        c.peer1 = null;
        if (c.peer2) c.peer2.emit('hangup');
      } else if (c.peer2 == socket) {
        c.peer2 = null;
        if (c.peer1) c.peer1.emit('hangup');
      }
    }
  });
  // Video
  socket.use((packet, next) => {
    console.log(packet)
    const id = packet[packet.length-1];
    const channel = channels[id];
    if (channel)  {
      console.log(channel.peer1 ? channel.peer1.id: null)
      console.log(channel.peer2 ? channel.peer2.id: null);
    }
    return next();
  })
  socket.on('sendOffer', (description, channelId) => {
    const other = getOtherPeer(socket, channelId);
    if (other) other.emit('offer', description);
    else socket.emit('warning', 'Cannot send offer');
  });
  socket.on('sendAnswer', (description, channelId) => {
    const other = getOtherPeer(socket, channelId)
    if (other) other.emit('answer', description);
    else socket.emit('warning', 'Cannot send answer');
  });
  socket.on('addIceCandidate', (candidate, channelId) => {
    const other = getOtherPeer(socket, channelId);
    if (other) other.emit('candidate', candidate);
    else socket.emit('warning', 'Cannot send ICE candidate');
  });
  socket.on('hangup', (channelId) => {
    const other = getOtherPeer(socket, channelId)
    if (other) other.emit('hangup');
    const c = channels[channelId];
    if (!c) return;
    if (socket == c.peer1) c.peer1 = null;
    else if (socket == c.peer2) c.peer2 = null;
  });  
}

module.exports = handleConnection;
