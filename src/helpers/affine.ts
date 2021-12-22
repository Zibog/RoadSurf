export function createPerspectiveMatrix(fieldOfViewInRadians: number, aspectRatio: number, near: number, far: number) {
    // Construct a perspective matrix
    /*
       Field of view - the angle in radians of what's in view along the Y axis
       Aspect Ratio - the ratio of the canvas, typically canvas.width / canvas.height
       Near - Anything before this point in the Z direction gets clipped (outside of the clip space)
       Far - Anything after this point in the Z direction gets clipped (outside of the clip space)
    */
    const f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
    const rangeInv = 1 / (near - far);

    return [
        f / aspectRatio, 0,                          0,   0,
        0,               f,                          0,   0,
        0,               0,    (near + far) * rangeInv,  -1,
        0,               0,  near * far * rangeInv * 2,   1
    ];
}

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("#gl_canvas");

const fieldOfViewInRadians = Math.PI * 0.5;
const aspectRatio = canvas.width / canvas.height;
const nearClippingPlaneDistance = 0.1;
const farClippingPlaneDistance = 50;

export const perspectiveMatrix = createPerspectiveMatrix(
    fieldOfViewInRadians,
    aspectRatio,
    nearClippingPlaneDistance,
    farClippingPlaneDistance
);

function createModelMatrix(): number[] {
    //Scale down by 50%
    var scale: number[] = scaleMatrix(0.5, 0.5, 0.5);

    // Rotate a slight tilt
    var rotateX: number[] = rotateXMatrix(0.0);

    // Rotate according to time
    var rotateY: number[] = rotateYMatrix(0.0);

    // Move slightly down
    var position: number[] = translateMatrix(0, 0.7, 0);

    // Multiply together, make sure and read them in opposite order
    return multiplyArrayOfMatrices([
        position, // step 4
        rotateY,  // step 3
        rotateX,  // step 2
        scale     // step 1
    ]);
}

export const modelMatrix = createModelMatrix();

function multiplyArrayOfMatrices(matrices: number[][]): number[] {

    var inputMatrix = matrices[0];

    for(var i=1; i < matrices.length; i++) {
        inputMatrix = multiplyMatrices(inputMatrix, matrices[i]);
    }

    return inputMatrix;
}

function multiplyMatrices(a: any[], b: any[]): number[] {

    // TODO - Simplify for explanation
    // currently taken from https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L306-L337

    var result = [];

    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    result[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    result[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    result[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    result[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    result[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    result[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    result[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    result[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    result[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    result[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    result[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    result[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    result[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    result[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    result[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    result[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    return result;
}

function rotateXMatrix(a: number): number[] {

    var cos = Math.cos;
    var sin = Math.sin;

    return [
        1,       0,        0,     0,
        0,  cos(a),  -sin(a),     0,
        0,  sin(a),   cos(a),     0,
        0,       0,        0,     1
    ];
}

function rotateYMatrix(a: number): number[] {

    var cos = Math.cos;
    var sin = Math.sin;

    return [
        cos(a),   0, sin(a),   0,
        0,   1,      0,   0,
        -sin(a),   0, cos(a),   0,
        0,   0,      0,   1
    ];
}

function translateMatrix(x: number, y: number, z: number): number[] {
    return [
        1,    0,    0,   0,
        0,    1,    0,   0,
        0,    0,    1,   0,
        x,    y,    z,   1
    ];
}

function scaleMatrix(w: number, h: number, d: number): number[] {
    return [
        w,    0,    0,   0,
        0,    h,    0,   0,
        0,    0,    d,   0,
        0,    0,    0,   1
    ];
}