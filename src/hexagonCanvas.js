import CubeMemory from './cubeMemory'
import React, { useRef, useEffect, useState } from 'react';
import generateColor from './utils/generateGradient';
 
function HexagonCanvas(props) {
  const canvas = useRef();
  props.biRef.generateMapClick = generateMapClick;

  const height = Math.max(600,window.innerHeight * 0.9)
  const width = height * Math.sqrt(3) / 2 + 3
  let size = {
    x: 15,
    y: 15,
    z: 15
  }
  /*const requestedSize = {
    x: 10,
    y: 10,
    z: 10
  }*/


  const [buffer, setBufferState] = useState(() => createCube(size, 'random', true))
  size = buffer.size

  const geo = createLayout({sizePx: height / size.x, size, height, width})[0]

  // initialize the canvas context
  useEffect(() => {
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
        right: props.color.right.b ? generateColor(props.color.right.a, props.color.right.b,size.x).reverse() : props.color.right.a,
        left: props.color.left.b ? generateColor(props.color.left.a, props.color.left.b,size.y).reverse() : props.color.left.a,
        bottom: props.color.bottom.b ? generateColor(props.color.bottom.a, props.color.bottom.b,size.z): props.color.bottom.a
      },
      getColor: function(face, coord) {
        return Array.isArray(this.colorSpaces[face]) ? '#' + this.colorSpaces[face][coord] : this.colorSpaces[face]
      }
    }
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
  },[size, buffer, geo, props.showOutlines, props.color, width]);

  function generateMapClick(type, requestedSize) {
    const reqSize = parseInt(requestedSize)
    size = {x: reqSize, y: reqSize, z: reqSize}
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
    if(meta.buffer.cubeCount === 0) {
      setTimeout(() => alert('Now the universe is empty'), 100)
    }
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

function createCube(size, type = 'random',storage = false) {
  if(storage) {
    const cubeInMemory = CubeMemory.loadFromStorage()
    if(cubeInMemory) {
      return cubeInMemory
    }
  }
  const cube = new CubeMemory(size)
  //console.log('create cube - size',size.x,size.y,size.z)
  if(type === 'random') {
    for(let x = size.x - 1; x >= 0; x--)
    {
        for(let y = size.y - 1; y >= 0; y--)
        {
            const factor = (x + y) / (size.x + size.y) // Columns further away from POV are higher
            const rand = Math.round((Math.random() + factor) * size.z)
            for(let z = 0; z <= Math.min(rand,size.z - 1); z++) {
              if((cube.at({x: x+ 1,y,z}) ?? true) && (cube.at({x,y: y+1,z}) ?? true)) {
                cube.set({x, y, z}, 1, false)
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
          cube.set({x,y,z: 0}, 1, false)
        }
    }
  }
  cube.saveToStorage()
  cube.computeVisibleFaces()
  return cube
}

function renderCube(meta) {
  console.time('render')
  meta.ctx.clearRect(0, 0, 2 * meta.geo.w, 2 * meta.geo.h)
  
  const faces = meta.buffer.visibleFaces
  const length = faces.length / 4
  for(let i = 0; i < length; i++) {
    if(faces[4 * i + 3] === 1) {
      drawRhombus({x: faces[4*i], y: faces[4*i + 1], z: faces[4*i + 2]}, 'left', meta.getColor('left',faces[4*i]), meta)
    } else if(faces[4 * i + 3] === 2) {
      drawRhombus({x: faces[4*i], y: faces[4*i + 1], z: faces[4*i + 2]}, 'right', meta.getColor('right',faces[4*i + 1]), meta)
    } else {
      drawRhombus({x: faces[4*i], y: faces[4*i + 1], z: faces[4*i + 2] + 1}, 'bottom', meta.getColor('bottom',faces[4*i + 2]), meta)
    }
  }
  console.timeEnd('render')
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
  ctx.closePath()
}

function mod(num,n) {
  return ((num%n)+n)%n
}
 
export default HexagonCanvas;