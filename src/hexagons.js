import React, { useRef, useState } from "react";
import HexagonCanvas from "./hexagonCanvas";

function Hexagons() {
    const [showOutlines, setShowOutlines] = useState(false)
    const [hideBackground, setHideBackground] = useState(false)
    const biRef = {}

    return (<div className="Hexagon">
    <header className={hideBackground ? "Hexagon-header Hexagon-header-hideBackground" : "Hexagon-header Hexagon-header-showBackground"}>
        <HexagonCanvas fill={true} showOutlines={showOutlines} biRef={biRef}/>
        <div id="mySidepanel" className="sidepanel">
            <a href='#' className="closebtn" onClick={closeNav}>&times;</a>
            Generate map
            <a href='#' onClick={(e) => {e.preventDefault(); biRef.generateMapClick('random')}}>Random</a>
            <a href='#' onClick={(e) => {e.preventDefault(); biRef.generateMapClick('flat')}}>Flat</a>
            Visual<br />
            <input type="checkbox" id="chckOutlines" name="todo" value="show" checked={showOutlines} onChange={() => setShowOutlines(!showOutlines)}/>
            <label htmlFor="chckOutlines">Show outlines</label><br />
            <input type="checkbox" id="chckBground" name="todo" value="show" checked={hideBackground} onChange={() => setHideBackground(!hideBackground)}/>
            <label htmlFor="chckBground">Hide background</label>
        </div>

    <button id="sidePanelButton" className="openbtn" onClick={openNav}>&#9776;</button>
    </header>
  </div>);
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