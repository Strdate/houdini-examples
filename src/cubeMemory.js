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

    set({x, y, z}, val, saveToStorage = true) {
        if(!this.isInBounds({x, y, z}))
            throw new Error('Coord ' + x + ', ' + y + ', ' + z + ' is out of bounds')
        this.buffer[x * this.size.y * this.size.z + y * this.size.z + z] = val
        this.cubeCount = val ? this.cubeCount + 1 : this.cubeCount - 1
        if(saveToStorage) {
            this.saveToStorage()
        }
    }

    isInBounds({x, y, z}) {
        if( x < 0 || x >= this.size.x || y < 0 || y >= this.size.y || z < 0 || z >= this.size.z)
            return false
        return true
    }

    static loadFromStorage() {
        try {
            const obj = JSON.parse(window.localStorage.getItem('savedCube'))
            if(obj) {
                const cubeMemory = new CubeMemory({x: parseInt(obj.size.x), y: parseInt(obj.size.y), z: parseInt(obj.size.z)})
                cubeMemory.buffer = Uint8Array.from(atob(obj.buffer).split('').map(function (c) { return c.charCodeAt(0); }))
                cubeMemory.cubeCount = parseInt(obj.cubeCount)
                return cubeMemory
            }
        } catch { }
    }

    saveToStorage() {
        const obj = {
            size: this.size,
            cubeCount: this.cubeCount,
            buffer: btoa(String.fromCharCode.apply(null, this.buffer))
        }
        window.localStorage.setItem('savedCube',JSON.stringify(obj))
    }
}

export default CubeMemory