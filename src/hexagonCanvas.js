import CubeMemory from './cubeMemory'
import React, { useRef, useEffect } from 'react';
 
function HexagonCanvas(props) {
  const canvas = useRef();

  const sizePx = 40
  const size = {
    x: 10,
    y: 10,
    z: 10
  }

  const height = window.innerHeight
  const width = window.innerWidth

  //const cubes = createLayout({sizePx, size, height, width}).map((geo) => { return { cube: createCube(size), geo }})
  const geo = createLayout({sizePx, size, height, width})[0]
  const buffer = createCube(size)
  console.log(buffer)
  const meta = {
    size,
    buffer,
    geo,
    colorFor: function(face) {
      switch(face) {
        case 'right': return 'chocolate'
          //break
        case 'left': return 'sandybrown'
          //break
        case 'bottom': return 'tan'
          //break
        default: return 'grey'
      }
    }
  }

  // initialize the canvas context
  useEffect(() => {
    // dynamically assign the width and height to canvas
    const canvasEle = canvas.current;
    canvasEle.width = width;
    canvasEle.height = height;
 
    // get context of the canvas
    meta.ctx = canvasEle.getContext("2d");
  }, []);

  useEffect(() => {
    renderCube(meta)
  });
 
  return (
      <canvas ref={canvas}></canvas>
  );
}

function renderCube(meta) {
  console.log('render cube',meta)
  for(let i = meta.size.x + meta.size.y + meta.size.z; i >= 0; i--) {
    sameDistance(i,meta.size).forEach(point => {
      point = {x: point.x, y: point.y, z: meta.size.z - point.z - 1}
      const val = meta.buffer.at(point)
      if(val) {
        if(!meta.buffer.at({x: point.x - 1, y: point.y, z: point.z})) {
          drawRhombus(point, 'left', meta)
        }
        if(!meta.buffer.at({x: point.x, y: point.y - 1, z: point.z})) {
          drawRhombus(point, 'right', meta)
        }
        if(!meta.buffer.at({x: point.x, y: point.y, z: point.z + 1})) {
          drawRhombus({x: point.x, y: point.y,z: point.z + 1}, 'bottom', meta)
        }
      }
    });
  }
}

function sameDistance(target, size) {
  const array = []
  for(let i = size.x - 1; i >= 0; i--) {
    for(let j = size.y - 1; j >= 0; j--) {
      for(let k = size.z - 1; k >= 0; k--) {
        if(i + j + k === target) {
          array.push({x: i, y: j, z: k})
          break
        }
      }
    }
  }
  return array
}

function createLayout({sizePx, size, height, width}) {
  function createGeo(offsetX, offsetY) {
    geos.push({
      i: hexWidth / size.x,
      j: hexHeight / (2 * size.x),
      h: hexHeight,
      w: hexWidth,
      offsetX: offsetX,
      offestY: offsetY,
    })
  }
  const geos = []
  
  const hexHeight = size.x * sizePx
  const hexWidth = hexHeight * Math.sqrt(3) / 2
  createGeo((width - hexWidth) / 2,(height - hexHeight) / 2)
  return geos
}

function createCube(size) {
  const cube = new CubeMemory(size)

  for(let i = 0; i < size.x; i++) {
    for(let j = 0; j < size.y; j++) {
      for(let k = 0; k < size.x; k++) {
        cube.set({x: i,y: j,z: k}, k % 2 === 0 ? 1 : 0)
      }
    }
  }

  /*cube.heightMap = [
      [0, 2, 2, 4, 4, 5, 5, 5, 5, 5],
      [1, 3, 3, 4, 4, 5, 5, 5, 5, 5],
      [1, 4, 4, 4, 4, 5, 5, 3, 5, 5],
      [3, 4, 4, 5, 5, 5, 5, 5, 5, 5],
      [3, 4, 5, 5, 6, 5, 5, 5, 5, 5],
      [3, 4, 5, 5, 5, 5, 5, 5, 5, 5],
      [3, 4, 5, 5, 5, 5, 5, 5, 5, 6],
      [8, 4, 5, 5, 5, 5, 5, 5, 5, 7],
      [3, 4, 5, 5, 5, 5, 5, 5, 5, 8],
      [3, 4, 5, 5, 5, 5, 5, 5, 5, 9],
  ]*/

  /*cube.heightMap = [
      [0, 2, 2, 4, 4],
      [1, 3, 3, 4, 4],
      [1, 4, 4, 4, 4],
      [3, 4, 4, 5, 5],
      [3, 4, 5, 5, 5],
  ]*/
  return cube
}

function drawRhombus(coords, face, meta) {
  const {ctx, geo} = meta
  if(coords.x === null || coords.y === null || coords.z === null)
    return
  const startX = geo.offsetX + geo.w / 2 + (coords.x - coords.y) * geo.i / 2
  const startY = geo.offestY + geo.h - (coords.x + coords.y + 2 * coords.z) * geo.j / 2
  ctx.beginPath()
  ctx.moveTo( startX, startY )
  //ctx.lineTo = (x, y) => console.log(x, y)
  if(face === 'bottom') // bottom face
  {
    ctx.lineTo( startX + geo.i / 2, startY - geo.j / 2 )
    ctx.lineTo( startX, startY - geo.j )
    ctx.lineTo( startX - geo.i / 2, startY - geo.j / 2 )
  } else if(face === 'right') // right face
  {
    ctx.lineTo( startX + geo.i / 2, startY - geo.j / 2 )
    ctx.lineTo( startX + geo.i / 2, startY - 3 * geo.j / 2 )
    ctx.lineTo( startX, startY - geo.j )
  } else if (face === 'left') // left face
  {
    ctx.lineTo( startX - geo.i / 2, startY - geo.j / 2 )
    ctx.lineTo( startX - geo.i / 2, startY - 3 * geo.j / 2 )
    ctx.lineTo( startX, startY - geo.j )
  }
  ctx.lineTo( startX, startY )
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 1
  ctx.fillStyle = meta.colorFor(face)
  ctx.fill()
  ctx.stroke();
}
 
export default HexagonCanvas;