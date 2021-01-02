import React, { useRef, useState } from "react";
import HexagonCanvas from "./hexagonCanvas";

const colors = [
  {right: {a: '#e67733',b: '#925f3f'},
  left: {a: '#E77471',b: '#710515'},
  bottom: {a: '#fdea9b',b: '#f2c202'}},
  
  {right: {a: '#ffff55'},
  left: {a: '#ff5555'},
  bottom: {a: '#808080'}},
  
  {right: {a: '#0fb8eb'},
  left: {a: '#cccbce'},
  bottom: {a: '#eb8532'}},

  {right: {a: '#ff0000'},
  left: {a: '#00ff00'},
  bottom: {a: '#0000ff'}},

  {right: {a: '#171a1c'},
  left: {a: '#afbfdc'},
  bottom: {a: '#4e873d'}},

  {right: {a: '#e1dd72'},
  left: {a: '#a8c66c'},
  bottom: {a: '#1b6535'}},

  {right: {a: '#6d6ddf', b: '#191970'},
  left: {a: '#09e1d6', b: '#04625d'},
  bottom: {a: '#34c567', b: '#1b6535'}},

  {right: {a: '#ff0000', b: '#ffffff'},
  left: {a: '#00ff00', b: '#ffffff'},
  bottom: {a: '#0000ff', b: '#ffffff'}},
]

function Hexagons() {
    let pref
    try {
      pref = JSON.parse(window.localStorage.getItem('cubePreferences'))
    } catch {}

    const [showOutlines, setShowOutlines] = useState(pref?.showOutlines ?? false)
    const [hideBackground, setHideBackground] = useState(pref?.hideBackground ?? false)
    const [cubeSize, setcubeSize] = useState((pref?.cubeSize > 0 && pref?.cubeSize <= 80) ? pref.cubeSize : 15 )
    const [zoom, setZoom] = useState(1)
    const [color, setColor] = useState(pref?.color >= 0 && pref?.color < colors.length ? pref.color : 0)
    const hexagonCanvasRef = React.useRef()

    window.localStorage.setItem('cubePreferences',JSON.stringify({showOutlines, hideBackground, cubeSize, color}))

    return (<div className="Hexagon">
    <header className={hideBackground ? "Hexagon-header Hexagon-header-hideBackground" : "Hexagon-header Hexagon-header-showBackground"}>
        <HexagonCanvas fill={true} showOutlines={showOutlines} ref={hexagonCanvasRef} color={colors[color]} zoom={zoom}/>
        <div id="mySidepanel" className="sidepanel">
            <a href='#' className="closebtn" onClick={closeNav}>&times;</a>
            <h1>Generate map</h1>
            <a href='#' onClick={(e) => {e.preventDefault(); hexagonCanvasRef.current.generateMapClick('random', cubeSize)}}>Random</a>
            <a href='#' onClick={(e) => {e.preventDefault(); hexagonCanvasRef.current.generateMapClick('flat', cubeSize)}}>Flat</a>
            Size: {cubeSize}
            <div className="slidecontainer">
              <input type="range" min="1" max="80" value={cubeSize} onChange={(evt) => setcubeSize(parseInt(evt.target.value))} className="slider" step="1" id="cubeSize" />
            </div>
            <h1>Visual</h1>
            <input type="checkbox" id="chckOutlines" name="todo" value="show" checked={showOutlines} onChange={() => setShowOutlines(!showOutlines)}/>
            <label htmlFor="chckOutlines">Show outlines</label><br />
            <input type="checkbox" id="chckBground" name="todo" value="show" checked={hideBackground} onChange={() => setHideBackground(!hideBackground)}/>
            <label htmlFor="chckBground">Hide background</label><br /><br />
            Color
            <div className="colorSelect">
            <select value={color} onChange={(evt) => setColor(parseInt(evt.target.value))}>
              <option value="0">Red sand gradient</option>
              <option value="6">Oceanic gradient</option>
              <option value="4">Shaded grassland</option>
              <option value="5">Grassland</option>
              <option value="2">Arctic sun</option>
              <option value="1">Arcade</option>
              <option value="3">RGB</option>
              <option value="7">RGB gradient</option>
            </select><br /><br />Zoom: {zoom}x
            <div className="slidecontainer">
              <input type="range" min="0.5" max="5" value={zoom} onChange={(evt) => setZoom(Number(evt.target.value))} className="slider" step="0.5" id="zoom" />
            </div>
            <br /><br />
            <span className='smallText'>
            <a href='#' download="cube.png" id='downloadLink' onClick={() => downloadPNG()}>Download PNG</a>
            <a href='/backgrounds' target='_blank' rel='noopener'>Background generator</a>
            <a href='https://github.com/Strdate/houdini-examples' target='_blank' rel='noopener'>Source code</a>
            </span>
          </div>
        </div>

    <button id="sidePanelButton" className="openbtn" onClick={openNav}>&#9776;</button>
    </header>
  </div>);
  }
function downloadPNG(el) {
  const canvas = document.getElementById('canvasMain')
  const image = canvas.toDataURL('image/png')
  document.getElementById('downloadLink').href = image;
}

  /* Set the width of the sidebar to 250px (show it) */
function openNav() {
    document.getElementById("mySidepanel").style.right = "0";
    document.getElementById("sidePanelButton").style.visibility = "hidden";
  }
  
/* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
document.getElementById("mySidepanel").style.right = "-400px";
document.getElementById("sidePanelButton").style.visibility = "visible";
}

export default Hexagons;