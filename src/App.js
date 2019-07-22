import React, { Component, Fragment } from 'react';
import History from './History';
import Input from './Input';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: []
    }
    this.clearHistory = this.clearHistory.bind(this);
    this.appendHistory = this.appendHistory.bind(this);
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
        <nav><h1>Python 3 Console</h1></nav>
        <History history={this.state.history}/>
        <Input history={this.state.history}
          clearHistory={this.clearHistory}
          appendHistory={this.appendHistory}
        />
      </div>
    );
  }
}