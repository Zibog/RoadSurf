import {Texture} from "../materials/Texture";

export interface ITransform {
    shift: number[] | Float32Array,
    scale: number,
    perspective: number[],
    model: number[],
}

export interface ILocation {
    perspective?:  WebGLUniformLocation | null
}

export interface IBufferData {
    positionBuffer: WebGLBuffer | null,
    textureCoordBuffer: WebGLBuffer | null,
    bufferLength: number,
}

export interface IColor {
    red: number,
    green: number,
    blue: number,
}

export interface IMaterial {
    name: string,
    lightModel: number,
    textureImageURL: string,
    texture: Texture,
    Ka: IColor,
    Kd: IColor,
    Ks: IColor,
}