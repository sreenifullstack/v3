/**
 * An interface that describes a Vertex Attribute Pointer's internal format/layout.
 */
export interface VertexAttribute {
  /**
   * The amount of {@linkcode type} elements within this attribute.
   */
  size: number;

  /**
   * Which datatype this attribute is made of (`gl.FLOAT`, `gl.INT`, etc.).
   */
  type: GLenum;

  /**
   * How far apart, in **bytes,** each instance of this attribute is.
   */
  stride: number;

  /**
   * How wide, in **bytes,** this attribute is in its final buffer.
   */
  offset: number;
}

/**
 * A simple wrapper around a VAO and buffer of vertex data that is ready to be drawn to the screen.
 */
export class Mesh {
  protected gl: WebGL2RenderingContext;
  protected vao: WebGLVertexArrayObject;

  protected vertexData: ArrayBuffer;
  protected vertexBuffer: WebGLBuffer;

  public readonly vertexAttributes: VertexAttribute[];
  public readonly vertexCount: number;
  public readonly drawingMode: GLenum;

  /**
   * Constructs a new mesh.
   * @param gl The WebGL context this mesh should be attached to.
   * @param drawingMode What drawing mode this mesh should be drawn with. Valid options are:
   * `gl.TRIANGLES`, `gl.TRIANGLE_FAN`, `gl.TRIANGLE_STRIP`, `gl.LINE_STRIP`, `gl.LINE_LOOP`,
   * `gl.LINES`, and `gl.POINTS`.
   * @param vertexCount How many vertices this mesh is comprised of.
   * @param attributes The format that this mesh's vertex data is in.
   * @param vertexData This mesh's vertex data.
   */
  constructor(
    gl: WebGL2RenderingContext,
    drawingMode: GLenum,
    vertexData: ArrayBuffer,
    vertexCount: number,
    attributes: VertexAttribute[]
  ) {
    this.gl = gl;
    this.vertexData = vertexData;
    this.vertexCount = vertexCount;
    this.vertexAttributes = attributes;
    this.drawingMode = drawingMode;

    this.vao = gl.createVertexArray() as any;
    gl.bindVertexArray(this.vao);

    this.vertexBuffer = gl.createBuffer() as any;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);

    for (let i = 0; i < attributes.length; i++) {
      gl.vertexAttribPointer(
        i,
        attributes[i].size,
        attributes[i].type,
        false,
        attributes[i].stride,
        attributes[i].offset
      );
      gl.enableVertexAttribArray(i);
    }

    // Unbind our VAO to prevent outside code from accidentally modifying our vertex attributes.
    gl.bindVertexArray(null);
  }

  /**
   * Draws this mesh according to its current {@link drawingMode drawing mode}.
   *
   * This method assumes that an appropriate program has already been bound and that any required
   * uniforms have already been sent.
   */
  public draw(): void {
    this.gl.bindVertexArray(this.vao);
    this.gl.drawArrays(this.drawingMode, 0, this.vertexCount);
    this.gl.bindVertexArray(null);
  }
}
