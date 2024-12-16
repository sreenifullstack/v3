// ShaderProgram Class
export class ShaderProgram {
  constructor(gl, vsSource, fsSource) {
    this.gl = gl;
    this.program = this.initShaderProgram(vsSource, fsSource);
    if (!this.program) {
      throw new Error("Failed to initialize shader program.");
    }
    this.attribLocations = {};
    this.uniformLocations = {};
  }

  initShaderProgram(vsSource, fsSource) {
    const gl = this.gl;
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) {
      return null;
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error(
        "Unable to initialize the shader program: " +
          gl.getProgramInfoLog(shaderProgram)
      );
      gl.deleteProgram(shaderProgram);
      return null;
    }

    return shaderProgram;
  }

  loadShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(
        "An error occurred compiling the shaders: " +
          gl.getShaderInfoLog(shader)
      );
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  use() {
    this.gl.useProgram(this.program);
  }

  getAttribLocation(name) {
    if (!(name in this.attribLocations)) {
      this.attribLocations[name] = this.gl.getAttribLocation(
        this.program,
        name
      );
    }
    return this.attribLocations[name];
  }

  getUniformLocation(name) {
    if (!(name in this.uniformLocations)) {
      this.uniformLocations[name] = this.gl.getUniformLocation(
        this.program,
        name
      );
    }
    return this.uniformLocations[name];
  }
}
