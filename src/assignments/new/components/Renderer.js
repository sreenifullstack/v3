// Renderer Class
import { Texture } from "./Texture.js";
import { ShaderProgram } from "./ShaderProgram.js";
import { Light } from "./Light.js";
import { SceneObject } from "./SceneObject.js";

export class Renderer {
  constructor(canvas, uiElements) {
    this.canvas = canvas;
    this.gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!this.gl) {
      alert("WebGL not supported, please use a different browser.");
      return;
    }

    this.uiElements = uiElements;
    this.selectedObject = null;

    // Initialize
    this.init();
  }

  init() {
    const gl = this.gl;

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // Define shaders
    const vsObject = `
            attribute vec3 aPosition;
            attribute vec3 aNormal;
            attribute vec2 aTexCoord;

            uniform mat4 uModel;
            uniform mat4 uView;
            uniform mat4 uProjection;

            varying vec3 vNormal;
            varying vec3 vFragPos;
            varying vec2 vTexCoord;

            void main(void) {
                gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
                vFragPos = vec3(uModel * vec4(aPosition, 1.0));
                vNormal = mat3(uModel) * aNormal;
                vTexCoord = aTexCoord;
            }
          `;

    const fsObject = `
            precision mediump float;

            uniform int uNumLights;
            uniform vec3 uLightPositions[10];
            uniform vec3 uLightColors[10];

            uniform vec3 uViewPos;

            // Texture samplers
            uniform sampler2D uDiffuseMap;
            uniform sampler2D uSpecularMap;

            // For solid color and lighting
            uniform bool uUseTexture;
            uniform vec3 uColor;
            uniform bool uLightening;

            varying vec3 vNormal;
            varying vec3 vFragPos;
            varying vec2 vTexCoord;

            void main(void) {
                if (uLightening) {
                    vec3 ambient = vec3(0.1);
                    vec3 norm = normalize(vNormal);
                    vec3 viewDir = normalize(uViewPos - vFragPos);
                    vec3 result = vec3(0.0);

                    // Determine color
                    vec3 diffuseColor;
                    vec3 specularColor;
                    if (uUseTexture) {
                        diffuseColor = texture2D(uDiffuseMap, vTexCoord).rgb;
                        specularColor = texture2D(uSpecularMap, vTexCoord).rgb;
                    } else {
                        diffuseColor = uColor;
                        specularColor = vec3(1.0); // Default specular color
                    }

                    for(int i = 0; i < 10; i++) {
                        if(i >= uNumLights) break;
                        // Ambient
                        vec3 ambientComponent = ambient * uLightColors[i];

                        // Diffuse
                        vec3 lightDir = normalize(uLightPositions[i] - vFragPos);
                        float diff = max(dot(norm, lightDir), 0.0);
                        vec3 diffuse = diff * uLightColors[i] * diffuseColor;

                        // Specular
                        vec3 halfwayDir = normalize(lightDir + viewDir);
                        float spec = pow(max(dot(norm, halfwayDir), 0.0), 32.0);
                        vec3 specular = spec * uLightColors[i] * specularColor;

                        result += ambientComponent + diffuse + specular;
                    }

                    gl_FragColor = vec4(result, 1.0);
                } else {
                    if (uUseTexture) {
                        gl_FragColor = texture2D(uDiffuseMap, vTexCoord);
                    } else {
                        gl_FragColor = vec4(uColor, 1.0);
                    }
                }
            }
          `;

    const vsLight = `
            attribute vec3 aPosition;

            uniform mat4 uModel;
            uniform mat4 uView;
            uniform mat4 uProjection;

            void main(void) {
                gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
            }
          `;

    const fsLight = `
            precision mediump float;

            uniform vec3 uLightColor;
            void main(void) {
                gl_FragColor = vec4(uLightColor, 1.0);
            }
          `;

    const vsPicking = `
            attribute vec3 aPosition;

            uniform mat4 uModel;
            uniform mat4 uView;
            uniform mat4 uProjection;

            void main(void) {
                gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
            }
          `;

    const fsPicking = `
            precision mediump float;

            uniform vec4 uPickColor;
            void main(void) {
                gl_FragColor = uPickColor;
            }
          `;

    // Initialize shader programs
    try {
      this.shaderObject = new ShaderProgram(gl, vsObject, fsObject);
      this.shaderLight = new ShaderProgram(gl, vsLight, fsLight);
      this.shaderPicking = new ShaderProgram(gl, vsPicking, fsPicking);
    } catch (error) {
      console.error("Error initializing shader programs:", error);
      return;
    }

    // Create buffer data for a cube
    const cubeData = this.createCube();
    const buffers = this.initBuffers(cubeData);

    // Load textures (Ensure these PNG images are in the same directory)
    this.textures = {
      cube1: new Texture(gl, "./images/1.png"), // Replace with actual URLs
      cube2: new Texture(gl, "./images/2.png"),
      cube2_specular: new Texture(gl, "./images/3.png"),
      cube3_diffuse: new Texture(gl, "./images/4.png"),
      cube3_specular: new Texture(gl, "./images/5.png"),
    };

    // Create scene objects
    this.objects = [
      // Cubes
      new SceneObject(gl, 1, buffers, {
        diffuse: this.textures.cube1,
      }),
      new SceneObject(
        gl,
        2,
        buffers,
        {
          diffuse: this.textures.cube2,
          specular: this.textures.cube2_specular,
        },
        true
      ),
      new SceneObject(
        gl,
        3,
        buffers,
        {
          diffuse: this.textures.cube3_diffuse,
          specular: this.textures.cube3_specular,
        },
        true
      ),
      // Bulbs
      new SceneObject(
        gl,
        4, // Unique ID for Bulb 1
        buffers,
        {}, // No textures
        false, // hasMultipleTextures
        [1.0, 1.0, 1.0], // White color
        false // lightening
      ),
      new SceneObject(
        gl,
        5, // Unique ID for Bulb 2
        buffers,
        {}, // No textures
        false, // hasMultipleTextures
        [1.0, 0.0, 0.0], // Red color
        false // lightening
      ),
      new SceneObject(
        gl,
        6, // Unique ID for Bulb 3
        buffers,
        {}, // No textures
        false, // hasMultipleTextures
        [0.0, 0.0, 1.0], // Blue color
        false // lightening
      ),
    ];

    // Position the cubes
    this.objects[0].position = [-2.0, 0.0, -5.0]; // Cube 1
    this.objects[1].position = [2.0, 0.0, -5.0]; // Cube 2
    this.objects[2].position = [0.0, 2.0, -5.0]; // Cube 3

    // Position the bulbs
    this.objects[3].position = [0.0, 0.0, -5.0]; // White Bulb
    this.objects[4].position = [2.0, -2.0, -5.0]; // Red Bulb
    this.objects[5].position = [-1.5, -2.0, -5.0]; // Blue Bulb

    this.objects[3].scale = [0.3, 0.3, 0.3]; // Bulb (Central Position)
    this.objects[4].scale = [0.3, 0.3, 0.3]; // Bulb (Central Position)
    this.objects[5].scale = [0.3, 0.3, 0.3]; // Bulb (Central Position)

    // Update model matrices
    this.objects.forEach((obj) => obj.setTransform());

    // Define lights
    this.lights = [
      new Light(this.objects[3].position.slice(), [1.0, 1.0, 1.0]), // White Bulb
      new Light(this.objects[4].position.slice(), [1.0, 0.0, 0.0]), // Red Bulb
      new Light(this.objects[5].position.slice(), [0.0, 0.0, 1.0]), // Blue Bulb
    ];

    // Create light objects (small cubes for visualization)
    this.lightObjects = this.lights.map((light, index) => {
      const lightObj = new SceneObject(
        gl,
        100 + index, // Unique ID for light visualization
        buffers,
        {},
        false,
        light.color,
        false // lightening
      );
      lightObj.position = light.position;
      lightObj.scale = [0.3, 0.3, 0.3]; // Small size
      lightObj.setTransform();
      return lightObj;
    });

    // Setup camera
    this.eye = [0, 0, 0];
    this.center = [0, 0, -1];
    this.up = [0, 1, 0];
    this.viewMatrix = mat4.create();
    mat4.lookAt(this.viewMatrix, this.eye, this.center, this.up);

    this.projectionMatrix = mat4.create();
    mat4.perspective(
      this.projectionMatrix,
      glMatrix.toRadian(45),
      this.canvas.width / this.canvas.height,
      0.1,
      100.0
    );

    // Setup picking framebuffer
    this.setupPickingFramebuffer();

    // Setup UI
    this.setupUI();

    // Handle texture loading
    this.waitForTextures()
      .then(() => {
        requestAnimationFrame(this.render.bind(this));
      })
      .catch(() => {
        alert(
          "Failed to load one or more textures. Check the console for details."
        );
      });

    // Handle mouse clicks for picking
    this.canvas.addEventListener("click", this.handleClick.bind(this));
  }

  createCube() {
    // Positions
    const positions = [
      // Front face
      -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
      // Back face
      -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
      // Top face
      -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
      // Bottom face
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
      // Right face
      1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
      // Left face
      -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
    ];

    // Normals
    const normals = [
      // Front
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
      // Back
      0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
      // Top
      0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
      // Bottom
      0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
      // Right
      1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
      // Left
      -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    ];

    // Texture coordinates
    const texCoords = [
      // Front
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Back
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Top
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Bottom
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Right
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Left
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    ];

    // Indices
    const indices = [
      0,
      1,
      2,
      0,
      2,
      3, // Front
      4,
      5,
      6,
      4,
      6,
      7, // Back
      8,
      9,
      10,
      8,
      10,
      11, // Top
      12,
      13,
      14,
      12,
      14,
      15, // Bottom
      16,
      17,
      18,
      16,
      18,
      19, // Right
      20,
      21,
      22,
      20,
      22,
      23, // Left
    ];

    return { positions, normals, texCoords, indices };
  }

  initBuffers(cubeData) {
    const gl = this.gl;
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(cubeData.positions),
      gl.STATIC_DRAW
    );

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(cubeData.normals),
      gl.STATIC_DRAW
    );

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(cubeData.texCoords),
      gl.STATIC_DRAW
    );

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(cubeData.indices),
      gl.STATIC_DRAW
    );

    return {
      position: positionBuffer,
      normal: normalBuffer,
      texCoord: texCoordBuffer,
      indices: indexBuffer,
      vertexCount: cubeData.indices.length,
    };
  }

  setupPickingFramebuffer() {
    const gl = this.gl;
    this.pickingFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFramebuffer);

    // Create texture to render to
    this.pickingTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.pickingTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.canvas.width,
      this.canvas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Create renderbuffer for depth
    this.pickingRenderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.pickingRenderbuffer);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      this.canvas.width,
      this.canvas.height
    );

    // Attach texture and renderbuffer to framebuffer
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.pickingTexture,
      0
    );
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      this.pickingRenderbuffer
    );

    // Check framebuffer completeness
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.error("Picking framebuffer is not complete.");
    }

    // Unbind framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  setupUI() {
    this.uiElements.posX.disabled = true;
    this.uiElements.posY.disabled = true;
    this.uiElements.posZ.disabled = true;
    this.uiElements.rotX.disabled = true;
    this.uiElements.rotY.disabled = true;
    this.uiElements.rotZ.disabled = true;
    this.uiElements.scale.disabled = true;

    // Add event listeners
    this.uiElements.posX.addEventListener("input", () =>
      this.updateSelectedObject(
        "position",
        0,
        parseFloat(this.uiElements.posX.value)
      )
    );
    this.uiElements.posY.addEventListener("input", () =>
      this.updateSelectedObject(
        "position",
        1,
        parseFloat(this.uiElements.posY.value)
      )
    );
    this.uiElements.posZ.addEventListener("input", () =>
      this.updateSelectedObject(
        "position",
        2,
        parseFloat(this.uiElements.posZ.value)
      )
    );
    this.uiElements.rotX.addEventListener("input", () =>
      this.updateSelectedObject(
        "rotation",
        0,
        parseFloat(this.uiElements.rotX.value)
      )
    );
    this.uiElements.rotY.addEventListener("input", () =>
      this.updateSelectedObject(
        "rotation",
        1,
        parseFloat(this.uiElements.rotY.value)
      )
    );
    this.uiElements.rotZ.addEventListener("input", () =>
      this.updateSelectedObject(
        "rotation",
        2,
        parseFloat(this.uiElements.rotZ.value)
      )
    );
    this.uiElements.scale.addEventListener("input", () => {
      const scale = parseFloat(this.uiElements.scale.value);
      if (this.selectedObject) {
        this.selectedObject.scale = [scale, scale, scale];
        this.selectedObject.setTransform();
        // If the selected object is a light source, update the light position
        if (!this.selectedObject.lightening) {
          const lightIndex = this.objects.indexOf(this.selectedObject) - 3;
          if (lightIndex >= 0 && lightIndex < this.lights.length) {
            this.lights[lightIndex].position =
              this.selectedObject.position.slice();
            this.lightObjects[lightIndex].position =
              this.selectedObject.position.slice();
            this.lightObjects[lightIndex].setTransform();
          }
        }
      }
    });
  }

  updateSelectedObject(property, index, value) {
    if (this.selectedObject) {
      this.selectedObject[property][index] = value;
      this.selectedObject.setTransform();
      // If the selected object is a light source, update the light position
      if (!this.selectedObject.lightening) {
        const lightIndex = this.objects.indexOf(this.selectedObject) - 3;
        if (lightIndex >= 0 && lightIndex < this.lights.length) {
          this.lights[lightIndex].position =
            this.selectedObject.position.slice();
          this.lightObjects[lightIndex].position =
            this.selectedObject.position.slice();
          this.lightObjects[lightIndex].setTransform();
        }
      }
    }
  }

  waitForTextures() {
    const promises = Object.values(this.textures).map((texture) => {
      return new Promise((resolve, reject) => {
        const checkLoaded = () => {
          if (texture.loaded) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    });
    return Promise.all(promises);
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = this.canvas.height - (event.clientY - rect.top);

    // Bind picking framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.pickingFramebuffer);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);

    // Use picking shader
    this.shaderPicking.use();

    // Set projection and view matrices
    this.gl.uniformMatrix4fv(
      this.shaderPicking.getUniformLocation("uProjection"),
      false,
      this.projectionMatrix
    );
    this.gl.uniformMatrix4fv(
      this.shaderPicking.getUniformLocation("uView"),
      false,
      this.viewMatrix
    );

    // Draw each object with unique color
    this.objects.forEach((obj) => obj.drawForPicking(this.shaderPicking));

    // Read pixel
    const pixels = new Uint8Array(4);
    this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);

    console.log(`Picked Pixel: ${pixels}`);

    // Calculate picked ID
    const pickedID = pixels[0] + (pixels[1] << 8) + (pixels[2] << 16);

    console.log(`Picked ID: ${pickedID}`); // Add this line for debugging
    const pickedObject =
      this.objects.find((obj) => obj.id === pickedID) || null;

    if (pickedObject) {
      this.selectedObject = pickedObject;
      this.populateUI();
    } else {
      this.selectedObject = null;
      this.disableUI();
    }

    // Unbind framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  populateUI() {
    if (this.selectedObject) {
      this.uiElements.posX.disabled = false;
      this.uiElements.posY.disabled = false;
      this.uiElements.posZ.disabled = false;
      this.uiElements.rotX.disabled = false;
      this.uiElements.rotY.disabled = false;
      this.uiElements.rotZ.disabled = false;
      this.uiElements.scale.disabled = false;

      this.uiElements.posX.value = this.selectedObject.position[0];
      this.uiElements.posY.value = this.selectedObject.position[1];
      this.uiElements.posZ.value = this.selectedObject.position[2];
      this.uiElements.rotX.value = this.selectedObject.rotation[0];
      this.uiElements.rotY.value = this.selectedObject.rotation[1];
      this.uiElements.rotZ.value = this.selectedObject.rotation[2];
      this.uiElements.scale.value = this.selectedObject.scale[0];
    }
  }

  disableUI() {
    this.uiElements.posX.value = 0;
    this.uiElements.posY.value = 0;
    this.uiElements.posZ.value = 0;
    this.uiElements.rotX.value = 0;
    this.uiElements.rotY.value = 0;
    this.uiElements.rotZ.value = 0;
    this.uiElements.scale.value = 1;

    this.uiElements.posX.disabled = true;
    this.uiElements.posY.disabled = true;
    this.uiElements.posZ.disabled = true;
    this.uiElements.rotX.disabled = true;
    this.uiElements.rotY.disabled = true;
    this.uiElements.rotZ.disabled = true;
    this.uiElements.scale.disabled = true;
  }

  render() {
    const gl = this.gl;

    // Clear the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Use object shader
    this.shaderObject.use();

    // Set projection and view matrices
    gl.uniformMatrix4fv(
      this.shaderObject.getUniformLocation("uProjection"),
      false,
      this.projectionMatrix
    );
    gl.uniformMatrix4fv(
      this.shaderObject.getUniformLocation("uView"),
      false,
      this.viewMatrix
    );

    // Set camera position
    gl.uniform3fv(this.shaderObject.getUniformLocation("uViewPos"), this.eye);

    // Set lights
    gl.uniform1i(
      this.shaderObject.getUniformLocation("uNumLights"),
      this.lights.length
    );
    this.lights.forEach((light, index) => {
      if (index < 10) {
        // Ensure within array bounds
        gl.uniform3fv(
          this.shaderObject.getUniformLocation(`uLightPositions[${index}]`),
          light.position
        );
        gl.uniform3fv(
          this.shaderObject.getUniformLocation(`uLightColors[${index}]`),
          light.color
        );
      }
    });

    // Draw each object
    this.objects.forEach((obj) => obj.draw(this.shaderObject));

    // Draw light objects (visual representation)
    this.shaderLight.use();

    // Set projection and view matrices for lights
    gl.uniformMatrix4fv(
      this.shaderLight.getUniformLocation("uProjection"),
      false,
      this.projectionMatrix
    );
    gl.uniformMatrix4fv(
      this.shaderLight.getUniformLocation("uView"),
      false,
      this.viewMatrix
    );

    // Draw each light
    this.lightObjects.forEach((lightObj, index) => {
      gl.uniformMatrix4fv(
        this.shaderLight.getUniformLocation("uModel"),
        false,
        lightObj.modelMatrix
      );
      gl.uniform3fv(
        this.shaderLight.getUniformLocation("uLightColor"),
        this.lights[index].color
      );
      lightObj.draw(this.shaderLight);
    });

    // Request next frame
    requestAnimationFrame(this.render.bind(this));
  }
}
