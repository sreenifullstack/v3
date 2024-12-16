#version 300 es
precision mediump float;

// Input attributes from WebGL
layout(location = 0) in vec3 aPosition;  // Vertex position
layout(location = 1) in vec3 aNormal;    // Vertex normal

// Uniforms for transformations
uniform mat4 uModelMatrix;               // Model matrix for the object
uniform mat4 uViewMatrix;                // View matrix for the camera
uniform mat4 uProjMatrix;                // Projection matrix for perspective

// Outputs to the fragment shader
out vec3 vNormal;       // Transformed normal vector
out vec3 vPosition;     // World-space position of the vertex

void main() {
    // Calculate the world-space position of the vertex
    vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
    vPosition = worldPosition.xyz;

    // Transform the normal vector and pass it to the fragment shader
    // Note: We use the inverse transpose of the model matrix for correct normal transformation
    vNormal = mat3(transpose(inverse(uModelMatrix))) * aNormal;

    // Calculate the final position of the vertex in clip space
    gl_Position = uProjMatrix * uViewMatrix * worldPosition;
}
