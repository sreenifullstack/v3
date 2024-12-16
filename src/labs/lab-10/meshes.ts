import { vec2, vec3, vec4, Vec3, Vec4 } from 'mv-redux/vec';
import { Mesh } from './mesh';

const F32 = Float32Array.BYTES_PER_ELEMENT;

/**
 * Generates a {@link Mesh} for a box.
 * @param gl The WebGL context the mesh should be attached to.
 * @param w The width of the box (size along the `x`-axis).
 * @param h The height of the box (size along the `y`-axis).
 * @param d The depth of the box (size along the `z`-axis).
 * @param vertexColors An array of up to 8 different colours to colour the vertices of the box with.
 * If fewer than 8 are provided, they are indexed with wrap-around. Any beyond 8 are ignored.
 */
export function makeBoxMesh(
    gl: WebGL2RenderingContext,
    w: number = 1,
    h: number = 1,
    d: number = 1,
    vertexColors?: (Vec3 | Vec4)[],
): Mesh {
    const x = w / 2;
    const y = h / 2;
    const z = d / 2;

    const texValues = [vec2(0, 0), vec2(0, 1), vec2(1, 0), vec2(1, 1)];
    const posValues = [
        vec3(-x, +y, +z), vec3(-x, -y, +z), vec3(+x, +y, +z), vec3(+x, -y, +z), // Front quad
        vec3(-x, +y, -z), vec3(-x, -y, -z), vec3(+x, +y, -z), vec3(+x, -y, -z), // Back quad
    ];

    // Convert all colours to vec4 for consistency:
    const colValues = vertexColors?.map(v => vec4(...v, 1.0)) ?? [];

    // Indices are specified in `TL BL TR, TR BL BR` order.
    const texIndices = [1, 0, 3, 3, 0, 2];
    const posIndices = [
        2, 3, 6, 6, 3, 7, // +x (right)
        4, 5, 0, 0, 5, 1, // -x (left)
        4, 0, 6, 6, 0, 2, // +y (top)
        1, 5, 3, 3, 5, 7, // -y (bottom)
        0, 1, 2, 2, 1, 3, // +z (front)
        6, 7, 4, 4, 7, 5, // -z (back)
    ];

    const stride = 3 + 2 + 4;
    const vertexData = new Float32Array(36 * stride);
    for (let i = 0; i < 36; i++) {
        const pos = posValues[posIndices[i]];
        const tex = texValues[texIndices[i % 6]];
        const col = colValues[posIndices[i] % colValues.length] ?? vec4(0, 0, 0, 1);
        vertexData.set(pos, i * stride + 0);
        vertexData.set(tex, i * stride + 3);
        vertexData.set(col, i * stride + 5);
    }

    return new Mesh(gl, gl.TRIANGLES, vertexData, 36, [
        { size: 3, type: gl.FLOAT, offset: 0 * F32, stride: stride * F32 }, // Position
        { size: 2, type: gl.FLOAT, offset: 3 * F32, stride: stride * F32 }, // Texture coordinate
        { size: 4, type: gl.FLOAT, offset: 5 * F32, stride: stride * F32 }, // Vertex colour
    ]);
}


/**
 * Generates a {@link Mesh} for a pyramid.
 * @param gl The WebGL context the mesh should be attached to.
 * @param k The number of points around the pyramid's base.
 * @param h The height of the pyramid.
 * @param r The radius of the pyramid's base.
 * @param vertexColors An array of up to {@link k}+2 different colours to colour the vertices of the
 * pyramid with. If fewer than k+2 are provided, they are indexed with wrap-around. Any beyond k+2
 * are ignored. The first colour is assigned to the tip, and the last is assigned to the center of
 * the base.
 */
export function makePyramidMesh(
    gl: WebGL2RenderingContext,
    k: number = 4,
    h: number = 1.0,
    r: number = 1.0,
    vertexColors?: (Vec3 | Vec4)[],
): Mesh {
    // Clamp and round to integer:
    k = Math.floor(Math.max(k, 3));

    const colorValues = vertexColors?.map(v => vec4(...v, 1.0)) ?? [];

    // We push two triangles at a time: one that goes from the tip down to the current edge of the
    // base, and one that goes from that same side to the center of the base. That way, extending to
    // an arbitrary number of edges is easy (since we just have to rotate around an angle instead of
    // trying to triangulate a k-sided polygon).
    const stride = 3 + 2 + 4;
    const totalVertices = 2 * k * 6;
    const vertexData = new Float32Array(totalVertices * stride);
    for (let i = 0; i < k; i++) {
        const theta0 = -2 * Math.PI * ((i + 0) / k);
        const theta1 = -2 * Math.PI * ((i + 1) / k);

        const positions = [
            vec3(r * Math.cos(theta0), 0.0, r * Math.sin(theta0)),
            vec3(r * Math.cos(theta1), 0.0, r * Math.sin(theta1)),
            vec3(0, h, 0),
            vec3(0, 0, 0),
        ];

        const texCoords = [
            vec2((i + 0) / k, 0.0),
            vec2((i + 1) / k, 0.0),
            vec2((2 * i + 1) / (2 * k), 1.0), // Average of the previous two
            vec2((2 * i + 1) / (2 * k), -1.0),
        ];

        const colors = [
            colorValues[(((i + 0) % k) + 1) % (colorValues?.length - 1)] ?? vec4(0, 0, 0, 1),
            colorValues[(((i + 1) % k) + 1) % (colorValues?.length - 1)] ?? vec4(0, 0, 0, 1),
            colorValues[0] ?? vec4(0, 0, 0, 1),
            colorValues[colorValues?.length - 1] ?? vec4(0, 0, 0, 1),
        ];

        let offset = i * stride * 6; // We are pushing 6 vertices at a time
        for (const j of [2, 0, 1, 1, 0, 3]) {
            vertexData.set(positions[j], offset + 0);
            vertexData.set(texCoords[j], offset + 3);
            vertexData.set(colors[j], offset + 5);
            offset += stride;
        }
    }

    return new Mesh(gl, gl.TRIANGLES, vertexData, totalVertices, [
        { size: 3, type: gl.FLOAT, offset: 0 * F32, stride: stride * F32 }, // Position
        { size: 2, type: gl.FLOAT, offset: 3 * F32, stride: stride * F32 }, // Texture coordinate
        { size: 4, type: gl.FLOAT, offset: 5 * F32, stride: stride * F32 }, // Vertex colour
    ]);
}
