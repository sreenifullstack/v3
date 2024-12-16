// Fragment Shader
precision highp float;

uniform vec3 uColor;          // The color of the sphere (if needed)
uniform int uResolution;      // Sphere resolution
uniform vec3 uSkyTopColor;    // Sky color at the top (light blue)
uniform vec3 uSkyBottomColor; // Sky color at the bottom (darker blue)
uniform float uSphereRadius;  // The radius of the sphere to calculate the sky effect based on position

uniform float uTime;  // The radius of the sphere to calculate the sky effect based on position


varying vec3 vNormal;
varying vec3 vPosition;
varying vec4 mvPosition;


varying vec2 vUV;


// Original noise code from https://www.shadertoy.com/view/4sc3z2
#define MOD3 vec3(.1031,.11369,.13787)

vec3 hash33(vec3 p3) {
    p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}

float simplex_noise(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;

    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);

    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);

    vec3 d1 = d0 - (i1 - 1.0 * K2);
    vec3 d2 = d0 - (i2 - 2.0 * K2);
    vec3 d3 = d0 - (1.0 - 3.0 * K2);

    vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
    vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));

    return dot(vec4(31.316), n);
}

// Cloud noise function
float cloud_noise(vec3 p) {
    return simplex_noise(p * 0.2 + vec3(uTime * 0.002, uTime * 0.005, uTime * 0.005));  // Animate clouds with time
}

void main() {
    // Calculate the height relative to the sphere's radius for a gradient effect
    float height = normalize(mvPosition).z * 0.5;  // Get the y component of the normal vector

    // Linear interpolation between the top and bottom sky colors based on the height
    vec3 skyColor = mix(uSkyBottomColor, uSkyTopColor, (height + 1.0) * 0.5); // Normalize height to 0.0 to 1.0

    // Optionally add the color of the sphere on top of the sky effect
    vec3 finalColor = mix(skyColor, vec3(1.), 0.1 + normalize(abs(mvPosition)).z * 0.25  );  // Blend between sky and sphere color


     float noise = cloud_noise(vec3( vPosition.x * 0.25 , vPosition.y +  uTime*0.001,1.));

    // Color based on cloud density and noise
    float cloudCoverage = smoothstep(0.25, 0.755, noise);  // Controls cloud coverage

    // Interpolate between cloud color and sky color
    vec3 color = mix(finalColor, vec3(.7,.7,0.7), cloudCoverage * .85);
       
    gl_FragColor = vec4(color , 1.0);
}
