class CubeMemory
{
    constructor({x, y, z})
    {
        this.size = {x, y, z}
        this.buffer = new Uint8Array(x * y * z)
    }

    at({x, y, z}) {
        if( x < 0 || x >= this.size.x || y < 0 || y >= this.size.y || z < 0 || z >= this.size.z)
            return undefined
        return this.buffer[x * this.size.y * this.size.z + y * this.size.z + z]
    }

    set({x, y, z}, val) {
        if( x < 0 || x >= this.size.x || y < 0 || y >= this.size.y || z < 0 || z >= this.size.z)
            throw new Error('Out of bounds')
        this.buffer[x * this.size.y * this.size.z + y * this.size.z + z] = val
    }
}

export default CubeMemory