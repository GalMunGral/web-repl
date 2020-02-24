import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import App from './components/App';

import 'highlight.js/styles/github.css';
import './style.css';

ReactDOM.render(
  <BrowserRouter><App/></BrowserRouter>,
  document.getElementById('root')
)
