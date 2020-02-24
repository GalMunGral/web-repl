import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import History from './History';
import Input from './Input';
import io from 'socket.io-client';

// const HOST = 'https://31f846c7.ngrok.io';
const HOST = '';

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
    this.socket = io(`${HOST}/multi`);
    this.socket.on('set-channel', channelId => {
      this.setState({ channel: channelId });
    });
    this.setChannel(this.state.channel);
  }

  setChannel(channelId) {  
    this.socket.emit('subscribe', channelId);
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
          <span>
            <h1>Python Console Chat</h1>
            <Link to="/interview">(Switch to Interview Mode)</Link>
          </span>
          <span>
            <label htmlFor="channel">Current Channel:</label>
            <input id="channel" value={this.state.channel} onChange={e => {
              let channel = parseInt(e.target.value);
              if (isNaN(channel)) channel = 0;
              this.setChannel(channel);
              this.socket.emit('hello', 'hey')
            }}/>
          </span>
        </nav>
        <History history={this.state.history}/>
        <Input
          socket={this.socket}
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