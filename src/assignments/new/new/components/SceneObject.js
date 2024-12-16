// SceneObject Class
export class SceneObject {
  constructor(
    gl,
    id,
    buffers,
    textures = {},
    hasMultipleTextures = false,
    color = [1.0, 1.0, 1.0],
    lightening = true
  ) {
    this.gl = gl;
    this.id = id;
    this.buffers = buffers; // { position, normal, texCoord, indices, vertexCount }
    this.textures = textures; // { diffuse, specular }
    this.hasMultipleTextures = hasMultipleTextures;
    this.color = color; // [r, g, b]
    this.lightening = lightening; // Determines if affected by lighting
    this.modelMatrix = mat4.create();
    this.position = [0, 0, 0];
    this.rotation = [0, 0, 0]; // Degrees
    this.scale = [1, 1, 1];
    this.setTransform();
  }

  setTransform() {
    mat4.identity(this.modelMatrix);
    mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
    mat4.rotateX(
      this.modelMatrix,
      this.modelMatrix,
      glMatrix.toRadian(this.rotation[0])
    );
    mat4.rotateY(
      this.modelMatrix,
      this.modelMatrix,
      glMatrix.toRadian(this.rotation[1])
    );
    mat4.rotateZ(
      this.modelMatrix,
      this.modelMatrix,
      glMatrix.toRadian(this.rotation[2])
    );
    mat4.scale(this.modelMatrix, this.modelMatrix, this.scale);
  }

  draw(shaderProgram) {
    const gl = this.gl;

    // Determine if the object uses textures
    const useTexture = this.textures.diffuse ? true : false;

    // Bind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.enableVertexAttribArray(shaderProgram.getAttribLocation("aPosition"));
    gl.vertexAttribPointer(
      shaderProgram.getAttribLocation("aPosition"),
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
    gl.enableVertexAttribArray(shaderProgram.getAttribLocation("aNormal"));
    gl.vertexAttribPointer(
      shaderProgram.getAttribLocation("aNormal"),
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.texCoord);
    gl.enableVertexAttribArray(shaderProgram.getAttribLocation("aTexCoord"));
    gl.vertexAttribPointer(
      shaderProgram.getAttribLocation("aTexCoord"),
      2,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

    // Set model matrix
    gl.uniformMatrix4fv(
      shaderProgram.getUniformLocation("uModel"),
      false,
      this.modelMatrix
    );

    // Set lightening uniform
    gl.uniform1i(
      shaderProgram.getUniformLocation("uLightening"),
      this.lightening ? 1 : 0
    );

    if (this.lightening) {
      gl.uniform1i(
        shaderProgram.getUniformLocation("uUseTexture"),
        useTexture ? 1 : 0
      );

      if (useTexture) {
        // Bind textures
        if (this.textures.diffuse) {
          this.textures.diffuse.bind(0);
          gl.uniform1i(shaderProgram.getUniformLocation("uDiffuseMap"), 0);
        }
        if (this.hasMultipleTextures && this.textures.specular) {
          this.textures.specular.bind(1);
          gl.uniform1i(shaderProgram.getUniformLocation("uSpecularMap"), 1);
        }
      } else {
        // Set solid color
        gl.uniform3fv(shaderProgram.getUniformLocation("uColor"), this.color);
      }
    } else {
      // For non-lightened objects (like the bulb), set solid color without lighting
      gl.uniform1i(shaderProgram.getUniformLocation("uUseTexture"), 0);
      gl.uniform3fv(shaderProgram.getUniformLocation("uColor"), this.color);
    }

    // Draw the object
    gl.drawElements(
      gl.TRIANGLES,
      this.buffers.vertexCount,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  drawForPicking(shaderProgram) {
    const gl = this.gl;

    // Bind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.enableVertexAttribArray(shaderProgram.getAttribLocation("aPosition"));
    gl.vertexAttribPointer(
      shaderProgram.getAttribLocation("aPosition"),
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

    // Set model matrix
    gl.uniformMatrix4fv(
      shaderProgram.getUniformLocation("uModel"),
      false,
      this.modelMatrix
    );

    // Set unique color based on ID
    const r = (this.id & 0xff) / 255;
    const g = ((this.id >> 8) & 0xff) / 255;
    const b = ((this.id >> 16) & 0xff) / 255;
    gl.uniform4f(shaderProgram.getUniformLocation("uPickColor"), r, g, b, 1.0);

    // Draw the object
    gl.drawElements(
      gl.TRIANGLES,
      this.buffers.vertexCount,
      gl.UNSIGNED_SHORT,
      0
    );
  }
}
