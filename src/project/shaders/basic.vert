attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vUV;
varying vec3 vNormal;
varying vec4 mvPosition;
varying vec3 vPosition;

void main() {
    vPosition = aPosition;
    mvPosition =  uModelMatrix * vec4(aPosition, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
    vUV = aTexCoord;
    vNormal = aNormal;
}
