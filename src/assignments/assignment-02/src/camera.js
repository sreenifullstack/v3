import { SceneObject } from './sceneObject.js';
import { mat4 } from 'gl-matrix';

export class Camera extends SceneObject {
    constructor(fov, near, far, aspectRatio) {
        super("Camera");  // Inherit from SceneObject with a default name "Camera"
        this.fov = fov;            // Field of view in degrees
        this.near = near;          // Near clipping plane
        this.far = far;            // Far clipping plane
        this.aspectRatio = aspectRatio; // Aspect ratio (width / height)
    }

    // Method to get the view matrix, which moves the scene based on the camera's position and rotation
    get viewMatrix() {
        const viewMatrix = mat4.create();
        const modelMatrix = this.getModelMatrix();
        mat4.invert(viewMatrix, modelMatrix);  // The view matrix is the inverse of the model matrix
        return viewMatrix;
    }

    // Method to get the projection matrix for perspective projection
    get projectionMatrix() {
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, (this.fov * Math.PI) / 180, this.aspectRatio, this.near, this.far);
        return projectionMatrix;
    }
}
