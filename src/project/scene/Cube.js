import {
    SceneObject
} from "./SceneObject";


export class Cube extends SceneObject {
    constructor(gl, width = 1, height = 1, depth = 1, color = [1.0, 1.0, 1.0]) {
        super(gl); // Call the parent class constructor to initialize WebGL context
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.color = color;
        this.initCube(); // Initialize cube-specific geometry
    }

    initCube() {
        // Cube geometry creation, using width, height, depth
        const sX = this.width / 2;
        const sY = this.height / 2;
        const sZ = this.depth / 2;

        this.vertexData = new Float32Array([
            // Front face
            -sX, -sY, sZ, 0, 0, 1, 0, 0,
            sX, -sY, sZ, 0, 0, 1, 1, 0,
            sX, sY, sZ, 0, 0, 1, 1, 1,
            -sX, sY, sZ, 0, 0, 1, 0, 1,

            // Back face
            -sX, -sY, -sZ, 0, 0, -1, 0, 0,
            -sX, sY, -sZ, 0, 0, -1, 1, 0,
            sX, sY, -sZ, 0, 0, -1, 1, 1,
            sX, -sY, -sZ, 0, 0, -1, 0, 1,

            // Left face
            -sX, -sY, -sZ, -1, 0, 0, 0, 0,
            -sX, -sY, sZ, -1, 0, 0, 1, 0,
            -sX, sY, sZ, -1, 0, 0, 1, 1,
            -sX, sY, -sZ, -1, 0, 0, 0, 1,

            // Right face
            sX, -sY, -sZ, 1, 0, 0, 0, 0,
            sX, sY, -sZ, 1, 0, 0, 1, 0,
            sX, sY, sZ, 1, 0, 0, 1, 1,
            sX, -sY, sZ, 1, 0, 0, 0, 1,

            // Top face
            -sX, sY, -sZ, 0, 1, 0, 0, 0,
            sX, sY, -sZ, 0, 1, 0, 1, 0,
            sX, sY, sZ, 0, 1, 0, 1, 1,
            -sX, sY, sZ, 0, 1, 0, 0, 1,

            // Bottom face
            -sX, -sY, -sZ, 0, -1, 0, 0, 0,
            -sX, -sY, sZ, 0, -1, 0, 1, 0,
            sX, -sY, sZ, 0, -1, 0, 1, 1,
            sX, -sY, -sZ, 0, -1, 0, 0, 1
        ]);

        this.indices = new Uint16Array([
            0, 1, 2, 0, 2, 3, // Front face
            4, 5, 6, 4, 6, 7, // Back face
            8, 9, 10, 8, 10, 11, // Left face
            12, 13, 14, 12, 14, 15, // Right face
            16, 17, 18, 16, 18, 19, // Top face
            20, 21, 22, 20, 22, 23 // Bottom face
        ]);

        // Initialize buffers
        this.vertexBuffer = this.gl.createBuffer();
        this.indexBuffer = this.gl.createBuffer();

        // Load vertex data into buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);
    }

    // Render the cube
    draw(program, viewMatrix, projectionMatrix) {
        // Use the shader program and pass relevant uniforms like the color, matrices, etc.
        const modelMatrix = this.getModelMatrix();

        // Enable both front and back faces to be drawn
        // this.gl.enable(this.gl.CULL_FACE);
        // this.gl.cullFace(this.gl.BACK); // 

        // Enable vertex attributes and draw
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        const aPosition = this.gl.getAttribLocation(program, 'aPosition');
        this.gl.vertexAttribPointer(aPosition, 3, this.gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.enableVertexAttribArray(aPosition);

        const aNormal = this.gl.getAttribLocation(program, 'aNormal');
        this.gl.vertexAttribPointer(aNormal, 3, this.gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        this.gl.enableVertexAttribArray(aNormal);

        const aTexCoord = this.gl.getAttribLocation(program, 'aTexCoord');
        this.gl.vertexAttribPointer(aTexCoord, 2, this.gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);
        this.gl.enableVertexAttribArray(aTexCoord);

        // Set uniforms for the matrices and color
        const uModelMatrix = this.gl.getUniformLocation(program, 'uModelMatrix');
        this.gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);

        const uViewMatrix = this.gl.getUniformLocation(program, 'uViewMatrix');
        this.gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);

        const uProjectionMatrix = this.gl.getUniformLocation(program, 'uProjectionMatrix');
        this.gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

        const uColor = this.gl.getUniformLocation(program, 'uColor');
        this.gl.uniform3fv(uColor, this.color);

        // Draw the cube
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }
}