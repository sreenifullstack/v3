#version 300 es

// Input attributes from the vertex buffer
in vec3 aPosition;  // Vertex position attribute
in vec3 aColor;     // Vertex color attribute

// Output variable to pass the color to the fragment shader
out vec3 vColor;    // Interpolated color to be used by the fragment shader

// Uniforms for transformations applied to each vertex
uniform vec3 uScale;       // Scale transformation vector (scaling along x, y, z)
uniform vec3 uPosition;    // Translation transformation vector (position shift along x, y, z)
uniform float uRotationX;  // Rotation angle around the X-axis (in radians)
uniform float uRotationY;  // Rotation angle around the Y-axis (in radians)
uniform float uRotationZ;  // Rotation angle around the Z-axis (in radians)

void main() {
    // Apply scaling transformation to the vertex position
    vec3 scaledPosition = aPosition * uScale;

    // Apply rotation around the X-axis
    float sinX = sin(uRotationX);
    float cosX = cos(uRotationX);
    vec3 rotatedPositionX = vec3(
        scaledPosition.x,  // X remains unchanged
        scaledPosition.y * cosX - scaledPosition.z * sinX,  // Rotation affecting Y and Z components
        scaledPosition.y * sinX + scaledPosition.z * cosX   // Rotation affecting Y and Z components
    );

    // Apply rotation around the Y-axis
    float sinY = sin(uRotationY);
    float cosY = cos(uRotationY);
    vec3 rotatedPositionXY = vec3(
        rotatedPositionX.x * cosY + rotatedPositionX.z * sinY,  // Rotation affecting X and Z components
        rotatedPositionX.y,  // Y remains unchanged
        -rotatedPositionX.x * sinY + rotatedPositionX.z * cosY  // Rotation affecting X and Z components
    );

    // Apply rotation around the Z-axis
    float sinZ = sin(uRotationZ);
    float cosZ = cos(uRotationZ);
    vec3 rotatedPositionXYZ = vec3(
        rotatedPositionXY.x * cosZ - rotatedPositionXY.y * sinZ,  // Rotation affecting X and Y components
        rotatedPositionXY.x * sinZ + rotatedPositionXY.y * cosZ,  // Rotation affecting X and Y components
        rotatedPositionXY.z  // Z remains unchanged
    );

    // Apply translation to the final transformed position
    gl_Position = vec4(rotatedPositionXYZ + uPosition, 1.0);

    // Pass the vertex color to the fragment shader for interpolation
    vColor = aColor;
}
