#version 300 es
precision mediump float;

// Inputs from the vertex shader
in vec3 vNormal;       // Normal vector at the fragment
in vec3 vPosition;     // Position of the fragment in world space

// Uniforms for light and material properties
uniform vec3 uLightPosition;    // Position of the light source (e.g., the Sun)
uniform vec3 uLightColor;       // Color/intensity of the light source
uniform vec3 uAmbientColor;     // Ambient color to simulate background light
uniform vec3 uObjectColor;      // Base color of the object

// Output color
out vec4 fragColor;

void main() {
    // Calculate the normalized light direction
    vec3 lightDir = normalize(uLightPosition - vPosition);

    // Normalize the normal vector
    vec3 normal = normalize(vNormal);

    // Diffuse lighting calculation (Lambertian reflection)
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * uLightColor;

    // Combine ambient and diffuse lighting
    vec3 color = (uAmbientColor + diffuse) * uObjectColor;

    // Set the fragment color
    fragColor = vec4(color, 1.0);
}
