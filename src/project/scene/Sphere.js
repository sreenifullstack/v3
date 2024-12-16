import {
    SceneObject
} from "./SceneObject";

export class Sphere extends SceneObject {
    constructor(gl, radius = 1, resolution = 16, color = [1.0, 1.0, 1.0]) {
        super(gl); // Call the parent class constructor to initialize WebGL context
        this.radius = radius;
        this.resolution = resolution;
        this.color = color;
        this.initSphere(); // Initialize sphere-specific geometry
    }

    initSphere() {
        const vertices = [];
        const indices = [];

        for (let latNumber = 0; latNumber <= this.resolution; latNumber++) {
            const theta = latNumber * Math.PI / this.resolution;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lonNumber = 0; lonNumber <= this.resolution; lonNumber++) {
                const phi = lonNumber * 2 * Math.PI / this.resolution;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = this.radius * cosPhi * sinTheta;
                const y = this.radius * cosTheta;
                const z = this.radius * sinPhi * sinTheta;

                const u = lonNumber / this.resolution;
                const v = latNumber / this.resolution;

                vertices.push(x, y, z, u, v, x, y, z); // Position, Texture, Normal
            }
        }

        for (let latNumber = 0; latNumber < this.resolution; latNumber++) {
            for (let lonNumber = 0; lonNumber < this.resolution; lonNumber++) {
                const first = (latNumber * (this.resolution + 1)) + lonNumber;
                const second = first + this.resolution + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        this.vertexData = new Float32Array(vertices);
        this.indices = new Uint16Array(indices);

        // Initialize buffers
        this.vertexBuffer = this.gl.createBuffer();
        this.indexBuffer = this.gl.createBuffer();

        // Load vertex data into buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);
    }

    // Render the sphere with double-sided rendering
    draw(program, viewMatrix, projectionMatrix) {
        const modelMatrix = this.getModelMatrix();

        // Enable both front and back faces to be drawn
        // this.gl.enable(this.gl.CULL_FACE);
        // this.gl.cullFace(this.gl.BACK); // Cull the back face for better performance, or use FRONT_AND_BACK for full double-sided rendering

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

        // Set uniforms for the matrices, color, and resolution
        const uModelMatrix = this.gl.getUniformLocation(program, 'uModelMatrix');
        this.gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);

        const uViewMatrix = this.gl.getUniformLocation(program, 'uViewMatrix');
        this.gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);

        const uProjectionMatrix = this.gl.getUniformLocation(program, 'uProjectionMatrix');
        this.gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

        const uTime = this.gl.getUniformLocation(program, 'uTime');
        this.gl.uniform1f(uTime, this.time);

        const uColor = this.gl.getUniformLocation(program, 'uColor');
        this.gl.uniform3fv(uColor, this.color);

        const uResolution = this.gl.getUniformLocation(program, 'uResolution');
        this.gl.uniform1i(uResolution, this.resolution);

        const uSkyTopColor = this.gl.getUniformLocation(program, 'uSkyTopColor');
        const uSkyBottomColor = this.gl.getUniformLocation(program, 'uSkyBottomColor');

        this.gl.uniform3fv(uSkyTopColor, [0.53, 0.81, 0.98]); // Light blue
        this.gl.uniform3fv(uSkyBottomColor, [0.0, 0.0, 0.55]); // Dark blue


        // Draw the sphere
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }
}