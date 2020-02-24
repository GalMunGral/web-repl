import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import History from './History';
import Input from './Input';
import WebRTC from './WebRTC';
import io from 'socket.io-client';

// const HOST = 'https://31f846c7.ngrok.io';
const HOST = '';

export default class Interview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channel: -1,
      history: []
    }
    this.clearHistory = this.clearHistory.bind(this);
    this.appendHistory = this.appendHistory.bind(this);
    this.socket = io(`${HOST}/duo`);
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
            <h1>Python Console Interview</h1>
            <Link to="/chatroom">(Switch to Chat Room Mode)</Link>
          </span>
          <span>
            <label htmlFor="channel">Room #:</label>
            <input id="channel" value={this.state.channel} onChange={e => {
              let channel = parseInt(e.target.value);
              if (isNaN(channel)) channel = 0;
              this.setState({ channel });
            }}/>
          </span>
        </nav>
        <History history={this.state.history}/>
        <Input
          socket={this.socket}
          channel={this.state.channel}
          history={this.state.history}
          clearHistory={this.clearHistory}
          appendHistory={this.appendHistory}
        />
        <WebRTC
          socket={this.socket}
          channel={this.state.channel}
        />
      </div>
    );
  }
}