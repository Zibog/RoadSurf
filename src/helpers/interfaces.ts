export interface Transforms {
    shift: number[] | Float32Array,
    scale: number,
    perspective: number[],
    model: number[],
}

export interface Locations {
    perspective?:  WebGLUniformLocation | null
}