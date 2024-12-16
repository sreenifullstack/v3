import { mult } from 'mv-redux/ops';
import { Mat4 } from 'mv-redux/mat';
import { Vec3, vec3 } from 'mv-redux/vec';
import { rotationMatrix, scaleMatrix, translationMatrix } from 'mv-redux/transforms';

import { Mesh } from './mesh';


/**
 * Configuration options for where (in world-space) a new {@link Shape} should be positioned upon
 * creation.
 */
export interface ShapeTransformInfo {
    position?: Vec3;
    rotation?: Vec3;
    scale?: Vec3;
}


/**
 * A simple shape with a world-space transformation and an attached mesh.
 */
export class Shape {
    mesh: Mesh;

    position: Vec3;
    rotation: Vec3;
    scale: Vec3;

    constructor(mesh: Mesh, transform?: ShapeTransformInfo) {
        this.mesh = mesh;

        // Wrap provided arguments with extra `vec3` call to clone the vector, so we don't end up
        // with multiple shapes sharing the same array references.
        this.position = vec3(transform?.position ?? [0, 0, 0]);
        this.rotation = vec3(transform?.rotation ?? [0, 0, 0]);
        this.scale = vec3(transform?.scale ?? [1, 1, 1]);
    }

    public getModelMatrix(): Mat4 {
        const S = scaleMatrix(this.scale);
        const T = translationMatrix(this.position);

        const Rx = rotationMatrix('x', this.rotation.x);
        const Ry = rotationMatrix('y', this.rotation.y);
        const Rz = rotationMatrix('z', this.rotation.z);
        const R = mult(Rz, mult(Ry, Rx));

        return mult(T, mult(R, S));
    }
}
