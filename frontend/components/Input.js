import React, { Component } from 'react';

export default class Input extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shiftPressed: false,
      value: '',
      index: this.props.history.length
    }
    this.history = [];
    this.reset = this.reset.bind(this);
    this.onKeyUp = this.onkeyup.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.props.socket.on('message', ({ channelId, senderIp, input, output }) => {
      if (channelId !== this.props.channel) {
        console.warn('Wrong Channel!');
      }
      this.props.appendHistory({
        senderIp,
        in: input,
        out: output.trim() || '(empty)'
      });
      this.reset();
    })
  }

  reset() {
    this.setState({
      shiftPressed: false,
      value: '',
      index: this.props.history.length
    });
  }
  
  onKeyDown(e) {
    switch(e.key) {
      case 'Tab':
      case 'ArrowUp':
      case 'ArrowDown':
        e.preventDefault();
        break;
      case 'Shift':
        this.setState({ shiftPressed: true });
        break;
      case 'Control':
        this.setState({ ctrlPressed: true });
        break;
    }
  }

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
          value: this.history[newIndex]
        })
        break;
      }
      case 'ArrowDown': {
        let length = this.history.length;
        let newIndex = this.state.index < length ? this.state.index + 1: length;
        this.setState({
          index: newIndex,
          value: newIndex < length ? this.history[newIndex] : ''
        })
        break;
      }
      case 'Shift': {
        this.setState({ shiftPressed: false });
        break;
      }
      case 'Control': {
        this.setState({ ctrlPressed: true });
        break;
      }
      case 'Enter': {
        if (this.state.shiftPressed) {
          if (this.state.value.trim() === 'clear') {
            this.props.clearHistory();
            this.reset();
          } else {
            this.execute(true);
          }
        } else if (this.state.ctrlPressed) {
          this.execute(false);
        }
        break;
      }
      default: {
        this.setState({ enterPressed: false });
      }
    }
  };
  
  execute(raw) {
    const input = raw ? this.state.value : `print('${this.state.value.replace(/'/g, '\\\'')}')`;
    console.log('Sending message', this.props.channel, input);
    this.props.socket.emit('message', {
      channelId: this.props.channel,
      input
    });
    this.history.push(input);
  }

  render() {
    return (
      <React.Fragment>
         <textarea className="card syntax-highlight" id="input" autoFocus rows="2" 
          value={this.state.value} placeholder="Type here"
          onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp}
          onChange={e => {
            this.setState({ value: e.target.value.replace(/\n/g, '\r') });
          }}
        />
        <p className="instruction">
            Set channel on the top right corner.<br/>
            Press 'Shift + Enter' to execute Python code. Execute 'clear' to clear console.<br/>
            Press 'Ctrl + Enter' to send message.
        </p>
      </React.Fragment>
    );
  }
}
