export interface Transforms {
    scale: number,
    perspective: number[],
    model: number[],
}

export interface Locations {
    perspective?:  WebGLUniformLocation | null
}