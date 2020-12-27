//import logo from './logo.svg';
import './App.css';
import workletURL from 'worklet-loader!./worklets/brickTiling.js';
import React from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import Hexagons from './hexagons';
//import workletURL from 'file-loader!houdini-static-gradient';

CSS.paintWorklet.addModule(workletURL)
/*CSS.paintWorklet.addModule(workletUrl).then(() => {
  console.log('Paint worklet added');
})*/

function App() {
  return (
  <Router>
      <Route path="/hexagon" component={Hexagons} />
      <Route exact path="/" component={Main} />
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
