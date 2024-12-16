#version 300 es

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProj;

out vec2 vTexCoord;

void main() {
    gl_Position = uProj * uView * uModel * vec4(aPosition, 1.0);
    vTexCoord = aTexCoord;
}