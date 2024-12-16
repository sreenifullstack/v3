import { mat4, vec3 } from 'gl-matrix'; // Assume gl-matrix is available for matrix operations

export class SceneObject {
    constructor(name, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
        this.name = name;
        this.position = vec3.clone(position);
        this.rotation = vec3.clone(rotation);
        this.scale = vec3.clone(scale);
        this.children = [];
        this.visible = true; // Visibility flag to control rendering
    }

    // Method to add a child to this object
    addChild(child) {
        this.children.push(child);
    }

    // Method to update transformations (can be overridden in subclasses)
    update(deltaTime) {
        // Placeholder for specific update logic, e.g., updating rotation angle based on orbit speed
    }

    // Method to calculate the object's model matrix
    getModelMatrix() {
        const modelMatrix = mat4.create();

        // Apply transformations in the order: Scale -> Rotate -> Translate
        mat4.translate(modelMatrix, modelMatrix, this.position);
        mat4.rotateX(modelMatrix, modelMatrix, this.rotation[0]);
        mat4.rotateY(modelMatrix, modelMatrix, this.rotation[1]);
        mat4.rotateZ(modelMatrix, modelMatrix, this.rotation[2]);
        mat4.scale(modelMatrix, modelMatrix, this.scale);

        return modelMatrix;
    }
}
