import { SceneObject } from './sceneObject.js';
import { vec3 } from 'gl-matrix';

export class CelestialBody extends SceneObject {
    constructor(name, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], orbitSpeed = 0.0) {
        super(name, position, rotation, scale);
        this.orbitSpeed = orbitSpeed; // Controls how fast the body rotates around its parent
        this.color = vec3.fromValues(1.0, 1.0, 1.0); // Default color (white)
    }

    // Override the update method to apply orbital rotation
    update(deltaTime) {
        // Increment rotation around the Y-axis (up-axis) based on orbit speed
        this.rotation[1] += this.orbitSpeed * deltaTime;
        this.rotation[1] %= 2 * Math.PI; // Keep the rotation angle within the 0-2π range

        // Call the parent update method if any additional updates are needed
        super.update(deltaTime);
    }
}
