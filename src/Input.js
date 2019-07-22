import React, { Component, Fragment } from 'react';

export default class Input extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enterPressed: false,
      value: '',
      index: this.props.history.length
    }
    this.reset = this.reset.bind(this);
    this.onKeyUp = this.onkeyup.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  reset() { this.setState( { enterPressed: false, value: '' }) };

  onkeyup(e) {
    switch(e.key) {
      case 'Tab': {
        this.setState({
          enterPressed: false,
          value: this.state.value + '  '
        })
        break;
      }
      case 'ArrowUp': {
        let newIndex= this.state.index > 0 ? this.state.index - 1: 0;
        this.setState({
          index: newIndex,
          value: this.props.history[newIndex].in
        })
        break;
      }
      case 'ArrowDown': {
        let length = this.props.history.length;
        let newIndex = this.state.index < length ? this.state.index + 1: length;
        this.setState({
          index: newIndex,
          value: newIndex < length ? this.props.history[newIndex].in : ''
        })
        break;
      }
      case 'Enter': {
        if (!this.state.enterPressed) {
          this.setState({ enterPressed: true });
          break;
        }
        if (this.state.value === 'clear\r\r') {
          this.props.clearHistory();
          this.reset();
        } else {
          this.execute(output => {
            this.props.appendHistory({
              in: this.state.value.replace(/\s+$/, ''),
              out: output
            })
            this.reset();
          });
        }
        break;
      }
      default: {
        this.setState({ enterPressed: false });
      }
    }
  };
  
  execute(outputHandler) {
    let headers = new Headers;
    headers.append('Content-Type', 'text/plain');
    let request = new Request('//localhost:8080/eval', {
      method: 'POST',
      headers: headers,
      body: this.state.value + ' '       
    })
  
    fetch(request).then(res => res.text())
      .then(outputHandler);
  }

  onKeyDown(e) {
    switch(e.key) {
      case 'Tab':
      case 'ArrowUp':
      case 'ArrowDown':
        e.preventDefault();
        break;
    }
  }

  render() {
    return (
      <textarea id="input" autoFocus id="input" rows="2" placeholder="Type here"
        value={this.state.value}
        onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp}
        onChange={e => {
          this.setState({ value: e.target.value.replace(/\n/g, '\r') });
        }}
      />
    );
  }
}

