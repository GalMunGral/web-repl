import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import ChatRoom from './ChatRoom';
import Interview from './Interview';

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Switch>
        <Route path="/chatroom">
          <ChatRoom/>
        </Route>
        <Route path="/interview">
          <Interview/>
        </Route>
        <Redirect to="/chatroom"/>
      </Switch>
    )
  }
}