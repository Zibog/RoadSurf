export const vsSource: string = `#version 300 es

in vec2 vertexPosition;
in vec2 textureCoords;

out vec2 texCoord;

uniform vec2 shift;
uniform float scale;

uniform mat4 modelView;
uniform mat4 projection;

void main() {
    gl_Position = projection*modelView*vec4(vertexPosition * scale + shift, 0.0, 1.0);
    texCoord = textureCoords;
}
`;

export const fsSource: string = `#version 300 es
precision mediump float;

in vec2 texCoord;

out vec4 color;

uniform sampler2D textureData;

void main() {
    color = texture(textureData, texCoord);
}
`;