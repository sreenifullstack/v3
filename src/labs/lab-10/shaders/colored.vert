#version 300 es

layout(location = 0) in vec3 aPosition;
layout(location = 2) in vec4 aColor;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProj;

out vec4 vColor;

void main() {
    gl_Position = uProj * uView * uModel * vec4(aPosition, 1.0);
    vColor = aColor;
}
