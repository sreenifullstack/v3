#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform mat3 uNormalMatrix;  // Add the normal matrix

out vec3 FragPos;
out vec3 Normal;

void main() {
    // Get world-space position:
    vec4 wsPos = uModelMatrix * vec4(aPosition, 1.0);
    FragPos = wsPos.xyz;

    // Transform normal with the normal matrix
    Normal = normalize(uNormalMatrix * aNormal);

    // Set the gl_Position
    gl_Position = uProjMatrix * uViewMatrix * wsPos;
}
