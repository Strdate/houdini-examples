/* eslint-disable */

registerPaint('hexagonal-tiling', class StaticGradient {

    static get inputProperties() {
      return [
        `--hexagonal-tiling-size`,
        `--hexagonal-tiling-side-length`,
        `--hexagonal-tiling-fill-screen`,
        `--hexagonal-tiling-color-1`,
        `--hexagonal-tiling-color-2`,
        `--hexagonal-tiling-color-3`,
        `--hexagonal-tiling-stroke-width`,
        `--hexagonal-tiling-stroke-color`,
        `--hexagonal-tiling-flat-surfaces-ratio`,
      ]
    }
  
    parseProps(props) {
      return [
        `--hexagonal-tiling-size`,
        `--hexagonal-tiling-side-length`,
        `--hexagonal-tiling-fill-screen`,
        `--hexagonal-tiling-color-1`,
        `--hexagonal-tiling-color-2`,
        `--hexagonal-tiling-color-3`,
        `--hexagonal-tiling-stroke-width`,
        `--hexagonal-tiling-stroke-color`,
        `--hexagonal-tiling-flat-surfaces-ratio`,
      ].map(param =>
        props.get(param).toString().trim() || undefined)
    }
  
    paint(ctx, bounds, props) {
      const { width, height } = bounds
      const sizekeys = {
        small:  20,
        medium: 40,
        large:  60,
      }
  
      const [
        sizePx = 40,
        sideLength = 10,
        fillScreen = 'enabled', 
        color1 = 'tan',
        color2 = 'chocolate',
        color3 = 'sandybrown', 
        strokeWidth = 1,
        strokeColor = 'black',
        flatSurfacesRatio = 0.7
      ] = this.parseProps(props)
  
      const sizePxInt = isNaN(parseInt(sizePx))
        ? sizekeys[sizePx]
        : parseInt(sizePx)
    
      const sideLengthInt = parseInt(sideLength)
      
      const cubes = createLayout({sizePx: sizePxInt, sideLength: sideLengthInt, height, width, fillScreen
        }).map((geo) => { return { cube: createCube(sideLengthInt, flatSurfacesRatio), geo }})

      cubes.forEach(({cube, geo}) => {[
        {type: 'bottom', color: color1},
        {type: 'right', color: color2},
        {type: 'left', color: color3}
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
              face,
              style: {
                strokeWidth,
                strokeColor
              }
            })
          }
        }
      })
    })
    }
  })

  function createLayout({sizePx, sideLength, height, width, fillScreen}) {
    function isVisible(hex) {
      return (hex.x < width && hex.x + hexWidth > 0 && hex.y < height && hex.y + hexHeight > 0)
    }
  
    function createGeo(offsetX, offsetY) {
      geos.push({
        i: hexWidth / sideLength,
        j: hexHeight / (2 * sideLength),
        h: hexHeight,
        w: hexWidth,
        offsetX: offsetX,
        offestY: offsetY,
      })
    }
  
    function getHexagonsInRow(startHex, sign = 1) {
      let j = sign === 1 ? 0 : 1
      while(fillScreen === 'enabled' || j === 0) {
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
      while(generating && (fillScreen === 'enabled' || i === 0)) {
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
    const hexHeight = sideLength * sizePx
    const hexWidth = hexHeight * Math.sqrt(3) / 2
  
    const offsetX = (width - hexWidth) / 2
    const offsetY = (height - hexHeight) / 2
    loopRows(offsetX, offsetY)
    loopRows(offsetX, offsetY, -1)
  
    return geos
  }
  
  function createCube(sideLength, flatSurfacesRatio) {
    const cube = {
        heightMap: [],
        handles: [],
        size: sideLength,
        getDepth: function(face, a, b) {
            if(face === 'bottom') {
                return this.heightMap[a][b]
            } else if(face === 'right')
            {
                for(let i = 0; i < sideLength; i++)
                {
                    if(cube.heightMap[a][i] > b)
                    {
                        return i
                    }
                }
            } else if(face === 'left')
            {
                for(let i = 0; i < sideLength; i++)
                {
                    if(cube.heightMap[i][a] > b)
                    {
                        return i
                    }
                }
            }
            return sideLength
        }
    }

    // Generate random cube arrangement
    const flat = Math.random() < flatSurfacesRatio
    for(let x = sideLength - 1; x >= 0; x--)
    {
        cube.heightMap[x] = []
        for(let y = sideLength - 1; y >= 0; y--)
        {
            if(!flat)
            {
              cube.heightMap[x][y] = Math.floor((x + y) / 2) // If not flat, generate simple 'staircase'. It will be randomized later on
            }
            else
            {
              const factor = (x + y) / (2 * sideLength) // Columns further away from POV are higher
              const rand = Math.round((Math.random() + factor) * sideLength)
              cube.heightMap[x][y] = Math.min(rand, cube.heightMap?.[x+1]?.[y] ?? sideLength, cube.heightMap[x][y+1] ?? sideLength)
            }
        }
    }
  
    // Add and remove cubes randomly (can be CPU intensive)
    if(!flat)
    {
      const interations = Math.min(100_000, sideLength * sideLength * Math.random() * 1000)
      for(let i = 0; i < interations; i++)
      {
          const x = Math.floor((Math.random()) * sideLength)
          const y = Math.floor((Math.random()) * sideLength)
          const val = cube.heightMap[x][y]
          if(Math.random() > 0.5)
          {
              if(val < sideLength && (cube.heightMap?.[x+1]?.[y] ?? sideLength) > val && (cube.heightMap?.[x]?.[y+1] ?? sideLength) > val)
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
  
  function drawRhombus({ctx, coords, geo, face, style}) {
    console.log(coords)
    const startX = geo.offsetX + geo.w / 2 + (coords.x - coords.y) * geo.i / 2
    const startY = geo.offestY + geo.h - (coords.x + coords.y + 2 * coords.z) * geo.j / 2
    ctx.beginPath()
    ctx.moveTo( startX, startY )
    if(face.type === 'bottom')
    {
      ctx.lineTo( startX + geo.i / 2, startY - geo.j / 2 )
      ctx.lineTo( startX, startY - geo.j )
      ctx.lineTo( startX - geo.i / 2, startY - geo.j / 2 )
    } else if(face.type === 'right')
    {
      ctx.lineTo( startX + geo.i / 2, startY - geo.j / 2 )
      ctx.lineTo( startX + geo.i / 2, startY - 3 * geo.j / 2 )
      ctx.lineTo( startX, startY - geo.j )
    } else if (face.type === 'left')
    {
      ctx.lineTo( startX - geo.i / 2, startY - geo.j / 2 )
      ctx.lineTo( startX - geo.i / 2, startY - 3 * geo.j / 2 )
      ctx.lineTo( startX, startY - geo.j )
    }
    ctx.lineTo( startX, startY )
    ctx.strokeStyle = style.strokeColor
    ctx.lineWidth = style.strokeWidth
    ctx.fillStyle = face.color
    ctx.fill()
    if(style.strokeWidth > 0)
    {
      ctx.stroke();
    }
  }