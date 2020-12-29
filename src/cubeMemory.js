class CubeMemory
{
    constructor({x, y, z})
    {
        this.size = {x, y, z}
        this.buffer = new Uint8Array(x * y * z)
    }

    at({x, y, z}) {
        if(!this.isInBounds({x, y, z}))
            return undefined
        return this.buffer[x * this.size.y * this.size.z + y * this.size.z + z]
    }

    set({x, y, z}, val) {
        if(!this.isInBounds({x, y, z}))
            throw new Error('Coord ' + x + ', ' + y + ', ' + z + ' is out of bounds')
        this.buffer[x * this.size.y * this.size.z + y * this.size.z + z] = val
        this.saveToStorage()
    }

    isInBounds({x, y, z}) {
        if( x < 0 || x >= this.size.x || y < 0 || y >= this.size.y || z < 0 || z >= this.size.z)
            return false
        return true
    }

    loadFromStorage() {
        const saved = window.localStorage.getItem('savedCube')
        if(saved) {
            this.buffer = Uint8Array.from(atob(saved).split('').map(function (c) { return c.charCodeAt(0); }))
            return true
        } else {
            return false
        }
    }

    saveToStorage() {
        window.localStorage.setItem('savedCube',btoa(String.fromCharCode.apply(null, this.buffer)))
    }
}

export default CubeMemory