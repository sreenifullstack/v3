#version 300 es

// Set the precision for floating point operations in the fragment shader
precision mediump float;

// Input from the vertex shader
in vec3 vColor;  // Interpolated color passed from the vertex shader

// Output fragment color to be rendered
out vec4 fragColor;

void main() {
    // Set the final fragment color using the interpolated vertex color
    fragColor = vec4(vColor, 1.0);  // RGB values from vColor, alpha set to 1.0 (fully opaque)
}
