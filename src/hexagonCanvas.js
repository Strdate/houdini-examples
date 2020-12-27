import React, { useRef, useEffect } from 'react';
 
function HexagonCanvas(props) {
  const canvas = useRef();
  let ctx = null;

  const sizePx = 40
  const size = 15

  const height = window.innerHeight
  const width = window.innerWidth

  const cubes = createLayout({sizePx, size, height, width}).map((geo) => { return { cube: createCube(size), geo }})

  // initialize the canvas context
  useEffect(() => {
    // dynamically assign the width and height to canvas
    const canvasEle = canvas.current;
    canvasEle.width = width;
    canvasEle.height = height;
 
    // get context of the canvas
    ctx = canvasEle.getContext("2d");
  }, []);

  useEffect(() => {
    cubes.forEach(({cube, geo}) => {[
      {type: 'bottom', color: 'tan'},
      {type: 'right', color: 'chocolate'},
      {type: 'left', color: 'sandybrown'}
      /*{type: 'bottom', color: '#ffff55'},
      {type: 'right', color: '#ff5555'},
      {type: 'left', color: '#808080'}*/
    ].forEach((face) => {
      for(let i = 0; i < cube.size; i++)
      {
        for(let j = 0; j < cube.size; j++)
        {
          drawRhombus({
            ctx,
            coords: {
              x: face.type === 'left' ? cube.getDepth(face.type, i, j) : i,
              y: face.type === 'right' ? cube.getDepth(face.type, i, j) : (face.type === 'bottom' ? j : i),
              z: face.type === 'bottom' ? cube.getDepth(face.type, i, j) : j
            },
            geo,
            face
          })
        }
      }
    })
  })});
 
  return (
      <canvas ref={canvas}></canvas>
  );
}

function createLayout({sizePx, size, height, width}) {
  function isVisible(hex) {
    return (hex.x < width && hex.x + hexWidth > 0 && hex.y < height && hex.y + hexHeight > 0)
  }

  function createGeo(offsetX, offsetY) {
    geos.push({
      i: hexWidth / size,
      j: hexHeight / (2 * size),
      h: hexHeight,
      w: hexWidth,
      offsetX: offsetX,
      offestY: offsetY,
    })
  }

  function getHexagonsInRow(startHex, sign = 1) {
    let j = sign === 1 ? 1 : 0
    while(true) {
      const newHex = {x: startHex.x + j * hexWidth, y: startHex.y}
      if(isVisible(newHex))
      {
        createGeo(newHex.x, newHex.y)
      }
      else
      {
        return Math.abs(j) > 0 ? true : false
      }
      j = j + 1 * sign
    }
  }

  function loopRows(defPointX, defPointY, sign = 1) {
    let i = sign === 1 ? 0 : 1
    let generating = true
    while(generating) {
      if(i % 2 === 0)
      {
        const lastHex = {x: defPointX, y: defPointY + i * (hexHeight) * 3 / 4 * sign}
        generating = getHexagonsInRow(lastHex, 1) && getHexagonsInRow(lastHex, -1)
      } else {
        const lastHex = {x: defPointX - hexWidth / 2, y: defPointY + 3 / 4 * (hexHeight) * sign + (i - 1) * (hexHeight) * 3 / 4 * sign}
        generating = getHexagonsInRow(lastHex, 1) && getHexagonsInRow(lastHex, -1)
      }
      i++
    }
  }

  const geos = []
  const hexHeight = size * sizePx
  const hexWidth = hexHeight * Math.sqrt(3) / 2

  const offsetX = (width - hexWidth) / 2
  const offsetY = (height - hexHeight) / 2
  loopRows(offsetX, offsetY)
  loopRows(offsetX, offsetY, -1)

  console.log(geos)
  return geos
}

function createCube(size) {
  const cube = {
      heightMap: [],
      handles: [],
      size,
      getDepth: function(face, a, b) {
          if(face === 'bottom') {
              return this.heightMap[a][b]
          } else if(face === 'right')
          {
              for(let i = 0; i < size; i++)
              {
                  if(cube.heightMap[a][i] > b)
                  {
                      return i
                  }
              }
          } else if(face === 'left')
          {
              for(let i = 0; i < size; i++)
              {
                  if(cube.heightMap[i][a] > b)
                  {
                      return i
                  }
              }
          }
          return size//null
      }
  }

  /*cube.heightMap = [
      [0, 2, 2, 4, 4, 5, 5, 5, 5, 5],
      [1, 3, 3, 4, 4, 5, 5, 5, 5, 5],
      [1, 4, 4, 4, 4, 5, 5, 5, 5, 5],
      [3, 4, 4, 5, 5, 5, 5, 5, 5, 5],
      [3, 4, 5, 5, 5, 5, 5, 5, 5, 5],
      [3, 4, 5, 5, 5, 5, 5, 5, 5, 5],
      [3, 4, 5, 5, 5, 5, 5, 5, 5, 6],
      [3, 4, 5, 5, 5, 5, 5, 5, 5, 7],
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
  const flat = Math.random() > 0.33

  for(let x = size - 1; x >= 0; x--)
  {
      cube.heightMap[x] = []
      for(let y = size - 1; y >= 0; y--)
      {
          if(!flat)
          {
            cube.heightMap[x][y] = Math.floor((x + y) / 2)
          }
          else
          {
            const factor = (x + y) / (2 * size)
            const rand = Math.round((Math.random() + factor) * size)
            cube.heightMap[x][y] = Math.min(rand, cube.heightMap?.[x+1]?.[y] ?? size, cube.heightMap[x][y+1] ?? size)
          }
      }
  }

  if(!flat)
  {
    const interations = Math.min(100_000, size * size * Math.random() * 1000)
    for(let i = 0; i < interations; i++)
    {
        const x = Math.floor((Math.random()) * size)
        const y = Math.floor((Math.random()) * size)
        const val = cube.heightMap[x][y]
        if(Math.random() > 0.5)
        {
            if(val < size && (cube.heightMap?.[x+1]?.[y] ?? size) > val && (cube.heightMap?.[x]?.[y+1] ?? size) > val)
            {
                cube.heightMap[x][y]++
            }
        } else {
            if(val > 0 && (cube.heightMap?.[x-1]?.[y] ?? 0) < val && (cube.heightMap?.[x]?.[y-1] ?? 0) < val)
            {
                cube.heightMap[x][y]--
            }
        }
    }
  }

  return cube
}

function drawRhombus({ctx, coords, geo, face}) {
  //console.log(coords,face)
  //if(coords.x === null || coords.y === null || coords.z === null)
  //  return
  const startX = geo.offsetX + geo.w / 2 + (coords.x - coords.y) * geo.i / 2
  const startY = geo.offestY + geo.h - (coords.x + coords.y + 2 * coords.z) * geo.j / 2
  ctx.beginPath()
  ctx.moveTo( startX, startY )
  //ctx.lineTo = (x, y) => console.log(x, y)
  if(face.type === 'bottom') // bottom face
  {
    ctx.lineTo( startX + geo.i / 2, startY - geo.j / 2 )
    ctx.lineTo( startX, startY - geo.j )
    ctx.lineTo( startX - geo.i / 2, startY - geo.j / 2 )
  } else if(face.type === 'right') // right face
  {
    ctx.lineTo( startX + geo.i / 2, startY - geo.j / 2 )
    ctx.lineTo( startX + geo.i / 2, startY - 3 * geo.j / 2 )
    ctx.lineTo( startX, startY - geo.j )
  } else if (face.type === 'left') // left face
  {
    ctx.lineTo( startX - geo.i / 2, startY - geo.j / 2 )
    ctx.lineTo( startX - geo.i / 2, startY - 3 * geo.j / 2 )
    ctx.lineTo( startX, startY - geo.j )
  }
  ctx.lineTo( startX, startY )
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 1
  ctx.fillStyle = face.color
  ctx.fill()
  ctx.stroke();
}
 
export default HexagonCanvas;