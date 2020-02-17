const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
var socket;
var localStream;
let peerConnection;
let incomingStream;

const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');
callButton.disabled = true;
hangupButton.disabled = true;

function createConnection() {
  peerConnection = new RTCPeerConnection({
    iceServers: [
      {urls: 'stun:stun.l.google.com:19302'}
    ]
  });

  for (let track of localStream.getTracks()) {
    peerConnection.addTrack(track);
  };

  peerConnection.addEventListener('icecandidate', async e => {
    if (e.candidate) {
      socket.emit('addIceCandidate', new RTCIceCandidate(e.candidate));
    }
  });
  
  peerConnection.addEventListener('iceconnectionstatechange', () => {
    if (peerConnection.iceConnectionState === "disconnected") {
      peerConnection.close();
    }
  });
  
  peerConnection.addEventListener('track', (event) => {
    if (!incomingStream) incomingStream = new MediaStream();
    remoteVideo.srcObject = incomingStream;
    incomingStream.addTrack(event.track);
  });
}

async function startAction() {
  startButton.disabled = true;
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true, audio: true
  });
  localVideo.srcObject = localStream;
  callButton.disabled = false;

  socket = io();
  socket.on('yo', msg => console.log(msg));
  socket.on('candidate', async (candidate) => {
    await peerConnection.addIceCandidate(candidate);
  })

  socket.on('offer', async (remoteDescription) => {
    callButton.disabled = true;
    hangupButton.disabled = false;  
    if (!peerConnection) createConnection();
    await peerConnection.setRemoteDescription(remoteDescription);
    localDescription = await peerConnection.createAnswer(remoteDescription);
    await peerConnection.setLocalDescription(localDescription);
    socket.emit('sendAnswer', localDescription);
  });

  socket.on('answer', async (remoteDescription) => {
    await peerConnection.setRemoteDescription(remoteDescription);
  });

  socket.on('hangup', () => {
    if (peerConnection) hangupAction();
  });

}

async function callAction() {
  callButton.disabled = true;
  hangupButton.disabled = false; 
  if (!peerConnection) createConnection();
  try {
    const description = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(description);
    socket.emit('sendOffer', description);
  } catch(e) {
    console.log(e);
  }
}

function hangupAction() {
  peerConnection.close();
  peerConnection = null;
  incomingStream = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
  socket.emit('hangup');
}

startButton.addEventListener('click', startAction);
callButton.addEventListener('click', callAction);
hangupButton.addEventListener('click', hangupAction);
