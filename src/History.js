import React, { Component, Fragment } from 'react';
import Row from './Row';
import hljs from 'highlight.js';

export default class History extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    document.querySelectorAll('pre.syntax-highlight').forEach((block) => {
      hljs.highlightBlock(block);
    });
  }

  render() {
    const Input = (entry, i) => (
      <Row>
        <div style={{ flex: '0 0 70px', color: 'orange' }}>{`In[${i}]: `}</div>
        <div className="block"><pre className="syntax-highlight">{entry.in}</pre></div>
      </Row>
    );

    return (
      <div className="vertical-center" style={{ marginTop: 80 }}>
      {this.props.history.map((entry, i) => (
        <div className="card" key={i}>
          {entry.in ? Input(entry, i) : null}
          <Row>
            <div style={{ flex: '0 0 70px', color: 'green' }}>{`Out[${i}]: `}</div>
            <div className="block"><pre>{entry.out}</pre></div>
          </Row>
        </div>
      ))}
      </div>
    );
  }
}