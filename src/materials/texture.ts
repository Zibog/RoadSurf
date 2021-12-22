export class Texture {
    private readonly glTexture: WebGLTexture | null;
    constructor(gl: WebGL2RenderingContext, image: TexImageSource) {
        this.glTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    use(gl: WebGL2RenderingContext) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    }
}