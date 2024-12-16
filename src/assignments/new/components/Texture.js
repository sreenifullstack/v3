// Texture Class
import { Functions } from "./Functions.js";

export class Texture {
  constructor(gl, url) {
    this.gl = gl;
    this.texture = gl.createTexture();
    this.image = new Image();
    this.image.crossOrigin = "";
    this.loaded = false;
    this.Functions = new Functions();

    this.image.onload = () => {
      this.bind();
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        this.image
      );

      if (
        this.Functions.isPowerOf2(this.image.width) &&
        this.Functions.isPowerOf2(this.image.height)
      ) {
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
      } else {
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_S,
          this.gl.CLAMP_TO_EDGE
        );
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_T,
          this.gl.CLAMP_TO_EDGE
        );
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_MIN_FILTER,
          this.gl.LINEAR
        );
      }
      this.loaded = true;
    };

    this.image.onerror = () => {
      console.error("Failed to load texture:", url);
    };

    this.image.src = url;
  }

  bind(unit = 0) {
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
}
