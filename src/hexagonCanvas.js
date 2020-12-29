import CubeMemory from './cubeMemory'
import React, { useRef, useEffect, useState } from 'react';
import generateColor from './utils/generateGradient';
 
function HexagonCanvas(props) {
  console.log('renderig')
  const canvas = useRef();
  props.biRef.generateMapClick = generateMapClick;

  const sizePx = 60
  const size = {
    x: 10,
    y: 10,
    z: 10
  }

  const height = size.x * sizePx
  const width = height * Math.sqrt(3) / 2 + 3

  //const cubes = createLayout({sizePx, size, height, width}).map((geo) => { return { cube: createCube(size), geo }})
  const geo = createLayout({sizePx, size, height, width})[0]

  const [buffer, setBufferState] = useState(createCube(size))

  console.log(buffer)
  const meta = {
    size,
    buffer,
    setBufferState,
    geo,
    preferences: {
      showOutlines: props.showOutlines
    },
    colorSpaces: {
      /*right: 'chocolate', //generateColor('#C85A17','#893e10',size.x),
      left: 'sandybrown', //generateColor('sandybrown','sandybrown',size.y),
      bottom: 'tan' //generateColor('tan','tan',size.z)*/
      right: generateColor('#e67733','#925f3f',size.x).reverse(),
      left: generateColor('#E77471','#710515',size.y).reverse(),
      bottom: generateColor('#fdea9b','#f2c202',size.z)
    },
    getColor: function(face, coord) {
      return '#' + this.colorSpaces[face][coord]
    }
  }

  // initialize the canvas context
  useEffect(() => {
    console.log('use effect!')
    // dynamically assign the width and height to canvas
    const canvasEle = canvas.current;
    canvasEle.width = width;
    canvasEle.height = height;
 
    // get context of the canvas
    meta.ctx = canvasEle.getContext("2d");
    meta.canvasEle = canvasEle

    const clickCallback = function(evt) {
      canvasClick(meta, evt.clientX, evt.clientY,'build')
    }
    canvasEle.addEventListener('click', clickCallback)
    const contextmenuCallback = function(evt) {
      evt.preventDefault()
      canvasClick(meta, evt.clientX, evt.clientY,'remove')
    }
    canvasEle.addEventListener('contextmenu', contextmenuCallback)

    renderCube(meta)
    return (() => {
      canvasEle.removeEventListener('click', clickCallback)
      canvasEle.removeEventListener('contextmenu', contextmenuCallback)
    })
  });

  function generateMapClick(type) {
    setBufferState(createCube(size, type))
  }
 
  return (
      <canvas ref={canvas}></canvas>
  );
}

function canvasClick(meta, clientX, clientY, action) {
  const rect = meta.canvasEle.getBoundingClientRect()
  const clickX = clientX - rect.left - meta.geo.offsetX - meta.geo.w / 2
  const clickY = clientY - rect.top - meta.geo.offsetY

  const coordXY = 2 * (clickX * meta.size.y) / meta.geo.w
  const coordZ = 2 * meta.size.z - 2 * ((clickY + (1 / Math.sqrt(3)) * clickX) * meta.size.z) / meta.geo.h
  const lightRayOut = lightRay(meta,coordXY,coordZ)
  if(lightRayOut) {
    if(action === 'build') {
      buildVoxel(meta, lightRayOut.point, lightRayOut.face)
    } else if(action === 'remove') {
      removeVoxel(meta, lightRayOut.point)
    }
  }
}

function lightRay(meta, coordXY, coordZ) {
  const triangle = mod(coordXY, 1) + mod(coordZ, 1) > 1 ? 1 : 0
  let z = Math.floor(coordZ)
  let x = Math.floor(coordXY) //+ Math.min(0,z - meta.size.z)
  let y = 0//Math.min(0,z - meta.size.z)
  //z = Math.min(meta.size.z, z)

  while(meta.size.z >= 0 && x < meta.size.x && y < meta.size.y) {
    if(meta.buffer.at({x, y, z})) {
      return {point: {x, y, z}, face: 'right'}
    } else if(triangle && meta.buffer.at({x: x + 1, y, z})) {
      return {point: {x: x+1, y, z}, face: 'left'}
    } else if(triangle && meta.buffer.at({x: x + 1, y, z: z - 1})) {
      return {point: {x: x + 1, y, z: z - 1}, face: 'bottom'}
    } else if(!triangle && meta.buffer.at({x, y, z: z - 1})) {
      return {point: {x, y, z: z - 1}, face: 'bottom'}
    } else if(!triangle && meta.buffer.at({x: x + 1, y, z: z - 1})) {
      return {point: {x: x + 1, y, z: z - 1}, face: 'left'}
    }
    x++
    y++
    z--
  }
}

function buildVoxel(meta, coords, face) {
  switch(face) {
    case 'right': coords = {x: coords.x, y: coords.y - 1, z: coords.z}
      break
    case 'left': coords = {x: coords.x - 1, y: coords.y, z: coords.z}
      break
    case 'bottom': coords = {x: coords.x, y: coords.y, z: coords.z + 1}
      break
    default: throw new Error('Unknown face')
  }
  if(meta.buffer.isInBounds(coords)) {
    meta.buffer.set(coords, 1)
    meta.setBufferState(meta.buffer) // same object - does not trigger update
    renderCube(meta)
  }
}

function removeVoxel(meta, coords) {
  if(meta.buffer.isInBounds(coords)) {
    meta.buffer.set(coords, 0)
    renderCube(meta)
    meta.setBufferState(meta.buffer) // same object - does not trigger update
  }
}

function createLayout({sizePx, size, height, width}) {
  function createGeo(offsetX, offsetY) {
    geos.push({
      i: hexWidth / size.x,
      j: hexHeight / (2 * size.x),
      h: hexHeight,
      w: hexWidth,
      offsetX: offsetX,
      offsetY: offsetY,
    })
  }
  const geos = []
  
  const hexHeight = size.x * sizePx
  const hexWidth = hexHeight * Math.sqrt(3) / 2
  createGeo((width - hexWidth) / 2,(height - hexHeight) / 2)
  return geos
}

function createCube(size, type = 'random') {
  const cube = new CubeMemory(size)

  if(type === 'random') {
    for(let x = size.x - 1; x >= 0; x--)
    {
        for(let y = size.y - 1; y >= 0; y--)
        {
            const factor = (x + y) / (size.x + size.y) // Columns further away from POV are higher
            const rand = Math.round((Math.random() + factor) * size.z)
            for(let z = 0; z <= Math.min(rand,size.z - 1); z++) {
              if((cube.at({x: x+ 1,y,z}) ?? true) && (cube.at({x,y: y+1,z}) ?? true)) {
                cube.set({x, y, z}, 1)
              } else {
                break
              }
            }
        }
    }
  } else {
    for(let x = size.x - 1; x >= 0; x--)
    {
        for(let y = size.y - 1; y >= 0; y--)
        {
          cube.set({x,y,z: 0}, 1)
        }
    }
  }

  return cube
}

function renderCube(meta) {
  //console.log('render cube',meta)
  meta.ctx.clearRect(0, 0, 2 * meta.geo.w, 2 * meta.geo.h)
  for(let i = meta.size.x + meta.size.y + meta.size.z; i >= 0; i--) {
    sameDistance(i,meta.size).forEach(point => {
      point = {x: point.x, y: point.y, z: meta.size.z - point.z - 1}
      const val = meta.buffer.at(point)
      if(val) {
        if(!meta.buffer.at({x: point.x - 1, y: point.y, z: point.z})) {
          drawRhombus(point, 'left', meta.getColor('left',point.x), meta)
        }
        if(!meta.buffer.at({x: point.x, y: point.y - 1, z: point.z})) {
          drawRhombus(point, 'right', meta.getColor('right',point.y), meta)
        }
        if(!meta.buffer.at({x: point.x, y: point.y, z: point.z + 1})) {
          drawRhombus({x: point.x, y: point.y,z: point.z + 1}, 'bottom', meta.getColor('bottom',point.z), meta)
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

function drawRhombus(coords, face, color, meta) {
  const {ctx, geo} = meta
  if(coords.x === null || coords.y === null || coords.z === null)
    return
  const startX = geo.offsetX + geo.w / 2 + (coords.x - coords.y) * geo.i / 2
  const startY = geo.offsetY + geo.h - (coords.x + coords.y + 2 * coords.z) * geo.j / 2
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
  ctx.strokeStyle = meta.preferences.showOutlines ? 'black' : color
  ctx.lineWidth = 1
  ctx.fillStyle = color
  ctx.fill()
  ctx.stroke();
}

function mod(num,n) {
  return ((num%n)+n)%n
}
 
export default HexagonCanvas;