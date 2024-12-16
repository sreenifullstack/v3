import { CelestialBody } from './celestialBody.js';
import { Camera } from './camera.js';
import { mat4 } from 'gl-matrix';

export function setupScene(gl) {
    // Create the Sun (root of the scene graph)
    const sun = new CelestialBody("Sun", [0, 0, 0], [0, 0, 0], [2, 2, 2], 0.0);
    sun.color = [1.0, 1.0, 0.0]; // Yellow color for the Sun

    // Create Earth and its Moon as children of the Sun
    const earth = new CelestialBody("Earth", [5, 0, 0], [0, 0, 0], [0.5, 0.5, 0.5], 0.01);
    earth.color = [0.0, 0.0, 1.0]; // Blue color for Earth
    const moon = new CelestialBody("Moon", [1, 0, 0], [0, 0, 0], [0.1, 0.1, 0.1], 0.05);
    moon.color = [0.6, 0.6, 0.6]; // Gray color for the Moon

    // Add Earth as a child of the Sun, and Moon as a child of Earth
    sun.addChild(earth);
    earth.addChild(moon);

    // Create Mars as another child of the Sun
    const mars = new CelestialBody("Mars", [8, 0, 0], [0, 0, 0], [0.4, 0.4, 0.4], 0.008);
    mars.color = [1.0, 0.5, 0.0]; // Orange color for Mars
    sun.addChild(mars);

    // Initialize cameras
    const overviewCamera = new Camera(45, 0.1, 1000, gl.canvas.width / gl.canvas.height);
    overviewCamera.position = [0, 10, 20];

    const planetCamera = new Camera(45, 0.1, 1000, gl.canvas.width / gl.canvas.height);
    planetCamera.position = [5, 2, 5];

    return {
        root: sun,                          // Root of the scene graph
        cameras: { overviewCamera, planetCamera },
        activeCamera: overviewCamera         // Set the default camera
    };
}

// Function to render the scene by traversing the scene graph
export function renderScene(scene, gl, time) {
    // Set up the light source position and properties
    const lightPosition = [0, 0, 0];      // Light at the center (Sun's position)
    const lightColor = [1.0, 1.0, 1.0];   // White light
    const ambientColor = [0.1, 0.1, 0.1]; // Soft ambient light

    // Use the active camera's view and projection matrices
    const viewMatrix = scene.activeCamera.viewMatrix;
    const projMatrix = scene.activeCamera.projectionMatrix;

    // Traverse the scene graph starting from the Sun
    traverseAndRender(scene.root, gl, mat4.create(), viewMatrix, projMatrix, lightPosition, lightColor, ambientColor, time);
}

// Recursive function to traverse the scene graph and render each object
function traverseAndRender(object, gl, parentMatrix, viewMatrix, projMatrix, lightPosition, lightColor, ambientColor, time) {
    if (!object.visible) return; // Skip rendering if the object is set to invisible

    // Update the object's rotation based on its orbit speed
    object.update(time * 0.001);

    // Calculate the model matrix for the object
    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, parentMatrix, object.position);
    mat4.rotateY(modelMatrix, modelMatrix, object.rotation[1]);
    mat4.scale(modelMatrix, modelMatrix, object.scale);

    // Set shader uniforms for matrices and lighting properties
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "uModelMatrix"), false, modelMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "uViewMatrix"), false, viewMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "uProjMatrix"), false, projMatrix);
    gl.uniform3fv(gl.getUniformLocation(gl.program, "uLightPosition"), lightPosition);
    gl.uniform3fv(gl.getUniformLocation(gl.program, "uLightColor"), lightColor);
    gl.uniform3fv(gl.getUniformLocation(gl.program, "uAmbientColor"), ambientColor);
    gl.uniform3fv(gl.getUniformLocation(gl.program, "uObjectColor"), object.color);

    // Render the object
    renderObject(gl, object);

    // Traverse and render each child
    for (let child of object.children) {
        traverseAndRender(child, gl, modelMatrix, viewMatrix, projMatrix, lightPosition, lightColor, ambientColor, time);
    }
}

// Placeholder function to render an object
// This function would ideally bind the vertex data and issue the draw call
function renderObject(gl, object) {
    // Assuming the object has a mesh with vertices and indices for drawing
    // For example, this would involve:
    // gl.bindVertexArray(object.mesh.vao); // Bind VAO if using one
    // gl.drawElements(gl.TRIANGLES, object.mesh.vertexCount, gl.UNSIGNED_SHORT, 0); // Draw call

    // Placeholder for rendering logic
}
