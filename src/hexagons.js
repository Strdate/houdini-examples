import React from "react";
import HexagonCanvas from "./hexagonCanvas";

function Hexagons() {
    return (<div className="Hexagon">
    <header className="Hexagon-header">
        <HexagonCanvas fill={true}/>
    </header>
  </div>);
  }

  export default Hexagons;