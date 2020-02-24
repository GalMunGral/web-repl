import React, { Component } from 'react';

const RTCState = {
  DISCONNECTED: 0,
  CONNECTED: 1,
  ONGOING: 2
}

export default class WebRTC extends Component {
  peerConnection;
  incomingStream;
  localStream;
  constructor(props) {
    super(props);
    this.state = {
      rtcState: RTCState.DISCONNECTED
    }
    this.localVideo = React.createRef();
    this.remoteVideo = React.createRef();
    this.createConnection = this.createConnection.bind(this);
    this.callAction = this.callAction.bind(this);
    this.hangupAction = this.hangupAction.bind(this);
    this.attachSignalHandlers(props.socket);
  }
  
  attachSignalHandlers(socket) {
    socket.on('joined', () => {
      console.log('Joined!');
      this.setState({ rtcState: RTCState.CONNECTED});
    });
    socket.on('candidate', (candidate) => {
      this.peerConnection.addIceCandidate(candidate);
    });
    socket.on('offer', async (remoteDescription) => {
      if (!this.peerConnection) {
        console.log('Call received, waking up...');
        await this.createConnection(socket);
      }
      await this.peerConnection.setRemoteDescription(remoteDescription);
      let localDescription = await this.peerConnection.createAnswer(remoteDescription);
      await this.peerConnection.setLocalDescription(localDescription);
      socket.emit('sendAnswer', localDescription, this.props.channel);
    });
    socket.on('answer', (remoteDescription) => {
      this.peerConnection.setRemoteDescription(remoteDescription);
    });
    socket.on('hangup', () => {
      if (this.peerConnection) this.hangupAction();
    });
    socket.on('warning', (msg) => console.log('Warning:', msg));
  }

  async createConnection() {
    console.log(this.peerConnection, this.incomingStream, this.localStream);
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
    });
    const options = { video: true, audio: true };
    this.localStream = await navigator.mediaDevices.getUserMedia(options);
    this.localVideo.current.srcObject = this.localStream;
    this.localStream.getTracks().forEach(t => this.peerConnection.addTrack(t));
    
    this.peerConnection.onicecandidate = async (e) => {
      console.log('Got ICE candidate!')
      if (!e.candidate) return;
      const candidate = new RTCIceCandidate(e.candidate)
      this.props.socket.emit('addIceCandidate', candidate, this.props.channel);
    };
    this.peerConnection.oniceconnectionstatechange = () => {
      if (this.peerConnection.iceConnectionState === "disconnected") {
        this.peerConnection.close();
      }
    };
    this.peerConnection.ontrack = (e) => {
      console.log('Got track!')
      if (!this.incomingStream) {
        this.incomingStream = new MediaStream();
        this.remoteVideo.current.srcObject = this.incomingStream;
        this.setState({ rtcState: RTCState.ONGOING });
      }
      this.incomingStream.addTrack(e.track);
    };
    this.props.socket.emit('ready', this.props.channel);
  }

  async callAction() {
    if (!this.peerConnection) this.createConnection();
    try {
      const description = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(description);
      this.props.socket.emit('sendOffer', description, this.props.channel);
    } catch(e) {
      console.log(e);
    }
  }
      
  hangupAction() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    };
    if (this.incomingStream) {
      this.incomingStream.getTracks().forEach(t => t.stop());
      this.remoteVideo.current.srcObject = null;
      this.incomingStream = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localVideo.current.srcObject = null;
      this.localStream = null;
    }
    this.props.socket.emit('hangup', this.props.channel);
    this.setState({ rtcState: RTCState.DISCONNECTED });
    console.log('Hung up');
  }

  componentWillUnmount() {
    this.hangupAction();
  }

  render() {
    return (
      <React.Fragment>
        <div id="webrtc">
          <div id="camera">
            <video style={{ display: this.state.rtcState !== RTCState.DISCONNECTED ? 'inline-block': 'none'}}
              ref={this.localVideo} autoPlay playsInline />
            <video style={{ display: this.state.rtcState === RTCState.ONGOING ? 'inline-block': 'none'}}
              ref={this.remoteVideo} autoPlay playsInline />  
          </div>
          {
            (() => {
              switch(this.state.rtcState) {
                case RTCState.DISCONNECTED:
                  return <button className="rtc-btn" onClick={this.createConnection}>Connect</button>
                case RTCState.CONNECTED:
                  return <button className="rtc-btn" onClick={this.callAction}>Call</button>
                case RTCState.ONGOING:
                  return <button className="rtc-btn" onClick={this.hangupAction}>Hang Up</button>
              }
            })()
          }          
        </div>
      </React.Fragment>
    )
  }
}