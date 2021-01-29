//import logo from './logo.svg';
import './App.css';
//import workletURL from 'worklet-loader!./worklets/brickTiling.js';
//import hexagonalTilingURL from '/worklets/hexagonalTiling.js';
//import brickTilingURL from 'worklet-loader!./worklets/brickTiling.js';
import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import Hexagons from './hexagons';
import BackgroundGenerator from './backgroundGenerator';
//import workletURL from 'file-loader!houdini-static-gradient';

if(CSS.paintWorklet) {
  CSS.paintWorklet.addModule('worklets/brickTiling.js')
  CSS.paintWorklet.addModule('worklets/hexagonalTiling.js')
}

function App() {
  return (
  <Router>
    <Switch>
        <Route path="/backgrounds" component={BackgroundGenerator} />
        <Route path="/" component={Hexagons} />
    </Switch>
  </Router>
  );
}

/*

      <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

*/

export default App;
