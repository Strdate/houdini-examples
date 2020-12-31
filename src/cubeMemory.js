class CubeMemory
{
    constructor({x, y, z})
    {
        this.size = {x, y, z}
        this.buffer = new Uint8Array(x * y * z)
        this.cubeCount = 0
    }

    at({x, y, z}) {
        if(!this.isInBounds({x, y, z}))
            return undefined
        return this.buffer[x * this.size.y * this.size.z + y * this.size.z + z]
    }

    set({x, y, z}, val, recompute = true) {
        if(!this.isInBounds({x, y, z}))
            throw new Error('Coord ' + x + ', ' + y + ', ' + z + ' is out of bounds')
        this.buffer[x * this.size.y * this.size.z + y * this.size.z + z] = val
        this.cubeCount = val ? this.cubeCount + 1 : this.cubeCount - 1
        if(recompute) {
            this.saveToStorage()
            this.computeVisibleFaces()
        }
    }

    isInBounds({x, y, z}) {
        if( x < 0 || x >= this.size.x || y < 0 || y >= this.size.y || z < 0 || z >= this.size.z)
            return false
        return true
    }

    computeVisibleFaces() {
        console.time('computeFaces')
        const visibleFaces = new Uint8Array(4 * (this.size.x * this.size.y + this.size.x * this.size.z + this.size.y * this.size.z))
        let visibleFacesCount = 0
        for(let i = this.size.x + this.size.y + this.size.z; i >= 0; i--) {
        this.sameDistance(i).forEach(point => {
                point = {x: point.x, y: point.y, z: this.size.z - point.z - 1}
                const val = this.at(point)
                if(val) {
                    if(!this.at({x: point.x - 1, y: point.y, z: point.z})) {
                        CubeMemory.addVisibleFace(point, visibleFaces, visibleFacesCount++, 1) // left
                    }
                    if(!this.at({x: point.x, y: point.y - 1, z: point.z})) {
                        CubeMemory.addVisibleFace(point, visibleFaces, visibleFacesCount++, 2) // right
                    }
                    if(!this.at({x: point.x, y: point.y, z: point.z + 1})) {
                        CubeMemory.addVisibleFace(point, visibleFaces, visibleFacesCount++, 3) // bottom
                    }
                }
            });
        }
        this.visibleFaces = new Uint8Array(visibleFaces.slice(0,visibleFacesCount * 4))
        console.timeEnd('computeFaces')
    }

    static addVisibleFace(point, buffer, pointer, type) {
        buffer[pointer * 4] = point.x
        buffer[pointer * 4 + 1] = point.y
        buffer[pointer * 4 + 2] = point.z
        buffer[pointer * 4 + 3] = type
    }

    sameDistance(target) {
        const array = []
        const minX = Math.max(0, target - this.size.y - this.size.z + 2)
        for(let i = this.size.x - 1; i >= minX; i--) {
          const minY = Math.max(0, target - i - this.size.z + 1)
          for(let j = this.size.y - 1; j >= minY; j--) {
            const z = target - i - j
            if(z >= 0 && z < this.size.z) {
              array.push({x: i, y: j, z: z})
            }
          }
        }
        return array
    }

    static loadFromStorage() {
        try {
            const obj = JSON.parse(window.localStorage.getItem('savedCube'))
            if(obj) {
                const cubeMemory = new CubeMemory({x: parseInt(obj.size.x), y: parseInt(obj.size.y), z: parseInt(obj.size.z)})
                cubeMemory.buffer = Uint8Array.from(atob(obj.buffer).split('').map(function (c) { return c.charCodeAt(0); }))
                cubeMemory.cubeCount = parseInt(obj.cubeCount)
                cubeMemory.computeVisibleFaces()
                return cubeMemory
            }
        } catch { }
    }

    saveToStorage() {
        if(this.size.x * this.size.y * this.size.z > 64000) {
            return
        }
        const obj = {
            size: this.size,
            cubeCount: this.cubeCount,
            buffer: btoa(String.fromCharCode.apply(null, this.buffer))
        }
        window.localStorage.setItem('savedCube',JSON.stringify(obj))
    }
}

export default CubeMemory