import React, { Component } from 'react';
import History from './History';
import Input from './Input';
import io from 'socket.io-client';
import { host, port} from './config';

const socket = io(`http://${host}:${port}`);
socket.on('info', info => console.log(info));

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channel: 0,
      history: []
    }
    this.setChannel = this.setChannel.bind(this);
    this.clearHistory = this.clearHistory.bind(this);
    this.appendHistory = this.appendHistory.bind(this);
    socket.on('set-channel', channelId => {
      this.setState({ channel: channelId });
    });
    this.setChannel(this.state.channel);
  }

  setChannel(channelId) {  
    socket.emit('subscribe', channelId);
  }
  clearHistory() {
    this.setState({ history: [] });
  }

  appendHistory(entry) {
    this.setState({ history: [...this.state.history, entry]})
  }

  render() {
    return (
      <div className="app">
        <nav>
          <h1>Python 3 Console &amp; Chat Room</h1>
          <input value={this.state.channel} onChange={e => {
            let channel = parseInt(e.target.value);
            if (isNaN(channel)) channel = 0;
            this.setChannel(channel);
            socket.emit('hello', 'hey')
          }}/>
        </nav>
        <History history={this.state.history}/>
        <Input
          socket={socket}
          channel={this.state.channel}
          setChannel={this.setChannel}
          history={this.state.history}
          clearHistory={this.clearHistory}
          appendHistory={this.appendHistory}
        />
      </div>
    );
  }
}