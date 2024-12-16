#version 300 es
precision highp float;

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

struct Light {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    vec3 position;
};

uniform Material uMaterial;
uniform Light uLight;
uniform mat4 uViewMatrix;

in vec3 FragPos;
in vec3 Normal;

out vec4 fColor;

// Blinn–Phong shading function
vec3 blinnPhong(Material material, Light light, vec3 viewPos) {
    vec3 lightDir = normalize(light.position - FragPos); // Direction to the light
    vec3 normal = normalize(Normal);                     // Normalized surface normal

    // Diffuse component
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = material.diffuse * light.diffuse * diff;

    // Ambient component
    vec3 ambient = material.ambient * light.ambient;

    // Specular component
    vec3 viewDir = normalize(viewPos - FragPos);         // Direction to the camera
    vec3 halfwayDir = normalize(lightDir + viewDir);     // Halfway vector
    float spec = pow(max(dot(normal, halfwayDir), 0.0), material.shininess);
    vec3 specular = material.specular * light.specular * spec;

    // Combine all components
    return ambient + diffuse + specular;
}

void main() {
    // Calculate the camera position from the view matrix
    mat4 viewInverse = inverse(uViewMatrix);
    vec3 cameraPos = vec3(viewInverse[3]);

    // Calculate the color using Blinn–Phong shading model
    vec3 color = blinnPhong(uMaterial, uLight, cameraPos);
    
    // Output the final fragment color
    fColor = vec4(color, 1.0);
}
