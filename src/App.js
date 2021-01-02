//import logo from './logo.svg';
import './App.css';
//import workletURL from 'worklet-loader!./worklets/brickTiling.js';
import hexagonalTilingURL from 'worklet-loader!./worklets/hexagonalTiling.js';
import brickTilingURL from 'worklet-loader!./worklets/brickTiling.js';
import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import Hexagons from './hexagons';
//import workletURL from 'file-loader!houdini-static-gradient';

if(CSS.paintWorklet) {
  CSS.paintWorklet.addModule(hexagonalTilingURL)
  CSS.paintWorklet.addModule(brickTilingURL)
}

function App() {
  return (
  <Router>
    <Switch>
        <Route path="/backgrounds" component={Main} />
        <Route path="/" component={Hexagons} />
    </Switch>
  </Router>
  );
}

function Main() {
  return (<div className="App">
  <header className="App-header">

  </header>
</div>);
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
