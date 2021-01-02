import CubeMemory from './cubeMemory'
import React, { Component } from 'react';
import generateColor from './utils/generateGradient';
 
class HexagonCanvas extends Component {
  constructor(props) {
    super(props)
    console.log('constructor')
    this.canvasElement = React.createRef()

    /*this.state = {
      buffer: {},
      size: {},
      geo: {},
      meta: {}
    }*/
  }

  static getDerivedStateFromProps(props, prevState) {
    console.log('get derived state from props')

    let buffer = prevState?.buffer

    let size = {
      x: 15,
      y: 15,
      z: 15
    }
    const zoom = props.zoom
    const height = zoom * Math.max(300,window.innerHeight * 0.9)
    const width = height * Math.sqrt(3) / 2 + 3
    if(!prevState?.buffer?.size) {
      buffer = createCube(size, 'random', true)
    }
    size = buffer.size
    
    return {
      buffer,
      size,
      geo: {
        i: (width - 3) / size.x,
        j: height / (2 * size.x),
        h: height,
        w: (width - 3),
        zoom,
        offsetX: 0,
        offsetY: 0,
      }, 
      meta: {
        preferences: {
          showOutlines: props.showOutlines
        },
        colorSpaces: {
          right: props.color.right.b ? generateColor(props.color.right.a, props.color.right.b,size.x).reverse() : props.color.right.a,
          left: props.color.left.b ? generateColor(props.color.left.a, props.color.left.b,size.y).reverse() : props.color.left.a,
          bottom: props.color.bottom.b ? generateColor(props.color.bottom.a, props.color.bottom.b,size.z): props.color.bottom.a
        },
        getColor: function(face, coord) {
          return Array.isArray(this.colorSpaces[face]) ? '#' + this.colorSpaces[face][coord] : this.colorSpaces[face]
        }
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(this.props.showOutlines === nextProps.showOutlines
      && this.props.color === nextProps.color
      && this.props.zoom === nextProps.zoom
      && this.state.buffer === nextState.buffer) {
      return false
    }
    return true
  }

  componentDidMount() {
    console.log('component did mount')
    this.canvasElement.current.addEventListener('click', this.canvasLeftClick)
    this.canvasElement.current.addEventListener('contextmenu', this.canvasRightClick)
    window.addEventListener('resize', this.windowResizedEvent)
    this.renderCanvas()
  }

  componentDidUpdate() {
    console.log('component did update')
    this.renderCanvas()
  }

  componentWillUnmount() {
    this.canvasElement.current.removeEventListener('click', this.canvasLeftClick)
    this.canvasElement.current.removeEventListener('contextmenu', this.canvasRightClick)
    window.removeEventListener('resize', this.windowResizedEvent)
    clearTimeout(this.windowResizedTimeout)
  }

  canvasLeftClick = (evt) => {
    this.canvasClick(evt.clientX, evt.clientY,'build')
  }

  canvasRightClick = (evt) => {
    evt.preventDefault()
    this.canvasClick(evt.clientX, evt.clientY,'remove')
  }

  generateMapClick = (type, requestedSize) => {
    const reqSize = parseInt(requestedSize)
    const size = {x: reqSize, y: reqSize, z: reqSize}
    this.setState({
      size,
      buffer: createCube(size, type)
    })
  }

  windowResizedEvent = (evt) => {
    clearTimeout(this.windowResizedTimeout)
    this.windowResizedTimeout = setTimeout(this.windowResizedDelayed, 100)
  }

  windowResizedDelayed = () => {
    this.forceUpdate()
  }

  // Section: Building / removing voxels

  canvasClick = (clientX, clientY, action) => {
    const rect = this.canvasElement.current.getBoundingClientRect()
    const clickX = clientX - rect.left - this.state.geo.offsetX - this.state.geo.w / 2
    const clickY = clientY - rect.top - this.state.geo.offsetY
  
    const coordXY = 2 * (clickX * this.state.size.y) / this.state.geo.w
    const coordZ = 2 * this.state.size.z - 2 * ((clickY + (1 / Math.sqrt(3)) * clickX) * this.state.size.z) / this.state.geo.h
    const lightRayOut = this.lightRay(coordXY,coordZ)
    if(lightRayOut) {
      if(action === 'build') {
        this.buildVoxel(lightRayOut.point, lightRayOut.face)
      } else if(action === 'remove') {
        this.removeVoxel(lightRayOut.point)
      }
    }
  }
  
  lightRay = (coordXY, coordZ) => {
    const meta = this.state
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
  
  buildVoxel = (coords, face) => {
    const meta = this.state
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
      this.renderCanvas()
    }
  }
  
  removeVoxel = (coords) => {
    const meta = this.state
    if(meta.buffer.isInBounds(coords)) {
      meta.buffer.set(coords, 0)
      this.renderCanvas()
      if(meta.buffer.cubeCount === 0) {
        setTimeout(() => alert('Now the universe is empty'), 100)
      }
    }
  }

  // Section: Rendering

  renderCanvas = () => {
    console.time('render')
    this.canvasElement.current.width = this.state.geo.w;
    this.canvasElement.current.height = this.state.geo.h;
    const ctx = this.canvasElement.current.getContext('2d')
    ctx.clearRect(0, 0, 2 * this.state.geo.w, 2 * this.state.geo.h)
    
    const faces = this.state.buffer.visibleFaces
    const length = faces.length / 4
    for(let i = 0; i < length; i++) {
      if(faces[4 * i + 3] === 1) {
        this.drawRhombus(ctx, {x: faces[4*i], y: faces[4*i + 1], z: faces[4*i + 2]}, 'left')
      } else if(faces[4 * i + 3] === 2) {
        this.drawRhombus(ctx, {x: faces[4*i], y: faces[4*i + 1], z: faces[4*i + 2]}, 'right')
      } else {
        this.drawRhombus(ctx, {x: faces[4*i], y: faces[4*i + 1], z: faces[4*i + 2] + 1}, 'bottom')
      }
    }
    console.timeEnd('render')
  }

  render() {
    console.log('react render')

    return (
      <canvas ref={this.canvasElement} id='canvasMain' className='Canvas-Main'></canvas>
    );
  }

  drawRhombus = (ctx, coords, face) => {
    const color = this.state.meta.getColor(face, face === 'left' ? coords.x : (face === 'right' ? coords.y : coords.z - 1))
    const geo = this.state.geo
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
    ctx.strokeStyle = this.state.meta.preferences.showOutlines ? 'black' : color
    ctx.lineWidth = 1
    ctx.fillStyle = color
    ctx.fill()
    ctx.stroke();
    ctx.closePath()
  }
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

function mod(num,n) {
  return ((num%n)+n)%n
}
 
export default HexagonCanvas;