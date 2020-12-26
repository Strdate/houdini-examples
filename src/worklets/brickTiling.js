/* eslint-disable */

registerPaint('brick-tiling', class StaticGradient {

    static get inputProperties() {
      return [
        `--brick-tiling-size`,
        `--brick-tiling-color-horizontal`,
        `--brick-tiling-color-vertical`,
        `--brick-tiling-stroke-width`,
        `--brick-tiling-stroke-color`,
        `--brick-tiling-rotation-ratio`,
        `--brick-tiling-visual-defects`
      ]
    }
  
    parseProps(props) {
      return [
        `--brick-tiling-size`,
        `--brick-tiling-color-horizontal`,
        `--brick-tiling-color-vertical`,
        `--brick-tiling-stroke-width`,
        `--brick-tiling-stroke-color`,
        `--brick-tiling-rotation-ratio`,
        `--brick-tiling-visual-defects`
      ].map(param =>
        props.get(param).toString().trim() || undefined)
    }
  
    paint(ctx, bounds, props) {
      const { width:w, height:h } = bounds
      const sizekeys = {
        small:  10,
        medium: 20,
        large:  40,
      }
  
      let [
        size = 20, 
        colorHorizontal = 'chocolate',
        colorVertical = 'sandybrown', 
        strokeWidth = 1,
        strokeColor = '#38f',
        rotationRatio = 0.5,
        visualDefects = false
      ] = this.parseProps(props)
  
      size = isNaN(parseInt(size))
        ? sizekeys[size]
        : parseInt(size)
  
      const maxHeight = Math.ceil(h / size)
      const maxWidth = Math.ceil(w / size)

      let curRow = []
      let nextRow = []
      let strokes = []
      let skip

      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth

      for (let x = 0; x < maxWidth; x++) {
        for (let y = 0; y < maxHeight; y++) { 
            if(!curRow[y] && !skip) {
                if(Math.random() > (0.366 * 2 * rotationRatio) && (!curRow[y+1] || visualDefects == 'enabled'))
                {
                    ctx.fillStyle = colorHorizontal
                    ctx.fillRect(x * size, y * size, size, 2 * size)
                    strokes.push({x: x * size, y: y * size, w: size, h: 2 * size})
                    skip = true
                } else {
                    ctx.fillStyle = colorVertical
                    ctx.fillRect(x * size, y * size, 2 * size, size)
                    strokes.push({x: x * size, y: y * size, w: 2 * size, h: size})
                    nextRow[y] = true
                }
            } else {
                skip = false
            }
        }
        curRow = nextRow
        nextRow = []
        skip = false
      }

      if(strokeWidth > 0) {
        strokes.forEach((rect) => {
          ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)
        })
      }
    }
  })