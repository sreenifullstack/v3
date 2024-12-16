#version 300 es

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord; // Add texture coordinate input

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

out vec2 vTexCoord; // Output variable for texture coordinates

void main() {
    gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
    vTexCoord = aTexCoord; // Pass texture coordinates to the fragment shader
}
