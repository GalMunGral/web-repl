const { spawn } = require('child_process');
const channels = {};

function subscribe(socket, channelId) {
  if (!(channelId in channels)) {
    const py = spawn('python3', ['kernel.py'])
    channels[channelId] = {
      instance: py,
      listeners: new Set(),
      last: { from: '', input: '' }
    };
    py.stdout.setEncoding('utf-8');
    py.stdout.on('data', (output) => {
      output += '\n'
      const channel = channels[channelId]
      channel.listeners.forEach(s => {
        s.emit('message', {
          channelId,
          senderIp: channel.last.from,
          input: channel.last.input,
          output
        });
      })
    });
  }
  if (socket._channelId in channels) {
    channels[socket._channelId].listeners.delete(socket);
  }
  channels[channelId].listeners.add(socket);
  socket._channelId = channelId;
  socket.emit('info', `Listening to channel ${channelId}.`);
  socket.emit('set-channel', channelId);
}

function sendMessage(socket, channelId, input) {
  subscribe(socket, channelId);
  const channel = channels[channelId];
  channel.last = { from: socket.handshake.address, input };
  channel.instance.stdin.write(input+'\n');
}

module.exports = function (socket) {
  socket.on('subscribe', (channelId) => subscribe(socket, channelId))
  socket.on('message', ({ channelId, input }) => sendMessage(socket, channelId, input));
  socket.on('disconnect', () => {
    if (socket._channelId in channels) {
      channels[socket._channelId].listeners.delete(socket);
    }
  });
}