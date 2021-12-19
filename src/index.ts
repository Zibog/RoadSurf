import {loadModelFromObj} from "./helpers/io";

const vsSource: string = `#version 300 es

in vec2 vertexPosition;
in vec2 textureCoords;

out vec2 texCoord;

uniform vec2 shift;
uniform float scale;

void main() {
    gl_Position = vec4(vertexPosition * scale + shift, 0.0, 1.0);
    texCoord = textureCoords;
}
`;

const fsSource: string = `#version 300 es
precision mediump float;

in vec2 texCoord;

out vec4 color;

uniform sampler2D textureData;

void main() {
    color = texture(textureData, texCoord);
}
`;

const bus = loadModelFromObj('resources/models/bus2.obj');

window.onload = function main(): void {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("#gl_canvas");
    const gl: WebGL2RenderingContext = canvas.getContext("webgl2")!;

    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const shaderProgram: WebGLProgram = initShaderProgram(gl, vsSource, fsSource)!;
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'vertexPosition'),
            textureCoordBuffer: gl.getAttribLocation(shaderProgram, 'textureCoords'),
        },
        uniformLocations: {
            textureData: gl.getUniformLocation(shaderProgram, 'textureData'),
            shift: gl.getUniformLocation(shaderProgram, 'shift'),
            scale: gl.getUniformLocation(shaderProgram, 'scale'),
        },
        textures: {
            texture: loadTexture(gl, 'resources/circus.png')
        }
    };

    const buffers = initBuffer(gl);

    let tick: number = 0;
    setInterval(() => {
        drawScene(gl, programInfo, buffers, tick++)
    }, 1000 / 60);
}

function loadShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
    const shader: WebGLShader = gl.createShader(type)!;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initShaderProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram | null {
    const vertexShader: WebGLShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)!;
    const fragmentShader: WebGLShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)!;

    const shaderProgram: WebGLProgram = gl.createProgram()!;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadTexture(gl: WebGL2RenderingContext, url: string): WebGLTexture | null {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level: number = 0;
    const internalFormat = gl.RGBA;
    const width: number = 1;
    const height: number = 1;
    const border: number = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    const pixel: Uint8Array = new Uint8Array([0, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    const image: HTMLImageElement = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
    image.src = url;

    return texture;
}

function initBuffer(gl: WebGL2RenderingContext) {
    const points: number[][] = [
        [-1, -1],
        [-1, +1],
        [+1, +1],

        [-1, -1],
        [+1, +1],
        [+1, -1],
    ];

    const positions: number[] = points.flat();

    const textureCoords: number[] = [
        [0.0, 1.0],
        [0.0, 0.0],
        [1.0, 0.0],

        [0.0, 1.0],
        [1.0, 0.0],
        [1.0, 1.0],
    ].flat();

    const positionBuffer = makeF32ArrayBuffer(gl, positions);
    const textureCoordBuffer = makeF32ArrayBuffer(gl, textureCoords);

    return {
        positionBuffer,
        textureCoordBuffer,
        bufferLength: points.length,
    };
}

function makeF32ArrayBuffer(gl: WebGL2RenderingContext, array: Iterable<number>): WebGLBuffer {
    const buffer: WebGLBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(array),
        gl.STATIC_DRAW
    );

    return buffer;
}

// @ts-ignore
function drawScene(gl: WebGL2RenderingContext, programInfo, buffers, tick: number): void {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawBuffers(gl, programInfo, buffers, [0, evaluateYShift(0, tick)], 0.5);
    drawBuffers(gl, programInfo, buffers, [0, evaluateYShift(1, tick)], 0.5);
    drawBuffers(gl, programInfo, buffers, [0, evaluateYShift(2, tick)], 0.5);
}

function evaluateYShift(index: number, tick: number): number {
    let frequency: number = 100;
    let numberOfSquares: number = 3;
    return 1.5 - ((tick + (frequency * index)) % (numberOfSquares * frequency)) / frequency;
}

// @ts-ignore
function drawBuffers(gl: WebGL2RenderingContext, programInfo, buffers, shift: number[] | Float32Array, scale: number): void {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoordBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoordBuffer, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoordBuffer);

    gl.useProgram(programInfo.program);
    gl.uniform1i(programInfo.uniformLocations.textureData, 0);
    gl.uniform2fv(programInfo.uniformLocations.shift, shift);
    gl.uniform1f(programInfo.uniformLocations.scale, scale);
    gl.drawArrays(gl.TRIANGLES, 0, buffers.bufferLength);
}