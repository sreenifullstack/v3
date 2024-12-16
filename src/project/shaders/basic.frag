precision mediump float;
      varying vec3 vNormal;
      varying vec2 vUV;
      uniform vec3 uLightColor;
      uniform vec3 uLightPosition;
      uniform vec3 uColor;

     varying vec4 mvPosition;


      void main() {
        // Simple diffuse lighting calculation
        vec3 lightDir = normalize(uLightPosition - gl_FragCoord.xyz);
        float diff = max(dot(vNormal, lightDir), 0.0);
        vec3 color = diff * uLightColor;
        
        float repeatFactor = clamp(length(mvPosition.z) * 0.5, 1.0, 3.0); // Adjust repeat factor dynamically

// Adjust UV coordinates for repeating pattern
vec2 uv2 = fract(vUV * repeatFactor);

        uv2 = fract(uv2)  ;
        // Window-like lighting effect (using the UV coordinates)
        if (uv2.x > 0.4 && uv2.x < 0.6 && uv2.y > 0.4 && uv2.y < 0.6) {
          color += vec3(1.); // Simulate window light effect
        }
        if (abs(vNormal.y) > 0.99) {
        color = vec3(0.0, 0.0, 0.0); // Red for the top face
    }
        gl_FragColor = vec4(mix(uColor,vec3(0.7, 0.7, 1.0),color),1.0);
      
      }