// Import statements
import {
  Camera
} from "./cameras/Camera.js";
import vertShaderSource from "./shaders/basic.vert";
import fragShaderSource from "./shaders/basic.frag";
import skyfragShaderSource from "./shaders/sky.frag";
import {
  City
} from "./scene/City.js";
import {
  Sphere
} from "./scene/Sphere.js";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("canvas");
  const gl = canvas.getContext("webgl2");

  // Configure WebGL settings
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Shader compilation helper function
  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  // Program linking helper function
  function linkProgram(gl, vertShader, fragShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  // Compile and link shaders
  const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertShaderSource);
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);
  const program = linkProgram(gl, vertShader, fragShader);

  const skyVert = compileShader(gl, gl.VERTEX_SHADER, vertShaderSource);
  const skyFrag = compileShader(gl, gl.FRAGMENT_SHADER, skyfragShaderSource);
  const sky_program = linkProgram(gl, skyVert, skyFrag);

  if (!program || !sky_program) {
    console.error("Failed to initialize shader program.");
    return;
  }

  // Initialize scene objects
  const city = new City(gl);
  city.scale = [1, 1, 1];
  const globe = new Sphere(gl, 30, 16, [1.0, 0.0, 1.0]);

  // Initialize main camera and camera control
  const mainCamera = new Camera(
    [0, 10, -10],
    [0, 0, 0],
    [0, 1, 0],
    50,
    canvas.width / canvas.height,
    0.1,
    1000
  );

  let animateCamera = true;
  let activeCamera = mainCamera;

  // Set up camera switch based on UI input
  document.getElementById("cameraSelect").addEventListener("change", (event) => {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      animateCamera = target.value === "animate";
    }
  });

  // Create path for the camera to follow
  const gridPath = [
    [0, 1, 5],
    [1, 1, 4],
    [2, 1, 3],
    [3, 1, 2],
    [4, 1, 1]
  ];
  mainCamera.setPath(gridPath);

  // Helper function to get input values from UI
  function getInputValue(event) {
    const target = event.target;
    return target instanceof HTMLInputElement ? parseFloat(target.value) : null;
  }

  // UI Controls for camera movement (x, y, z axes)
  ["xAxis", "yAxis", "zAxis"].forEach((axis) => {
    document.getElementById(axis).addEventListener("input", (event) => {
      const value = getInputValue(event);
      if (value !== null && !animateCamera) {
        const pos = activeCamera.position;
        if (axis === "xAxis") activeCamera.updatePosition(value, pos[1], pos[2]);
        if (axis === "yAxis") activeCamera.updatePosition(pos[0], value, pos[2]);
        if (axis === "zAxis") activeCamera.updatePosition(pos[0], pos[1], value);
      }
    });
  });

  // UI Controls for Field of View (FOV)
  document.getElementById("fov").addEventListener("input", (event) => {
    const value = getInputValue(event);
    if (value !== null) {
      activeCamera.fov = value;
      activeCamera.projectionMatrix = activeCamera.computeProjectionMatrix();
    }
  });

  // UI Controls for Camera Target
  ["targetX", "targetY", "targetZ"].forEach((axis) => {
    document.getElementById(axis).addEventListener("input", (event) => {
      const value = getInputValue(event);
      if (value !== null) {
        const target = activeCamera.target;
        if (axis === "targetX") activeCamera.target = [value, target[1], target[2]];
        if (axis === "targetY") activeCamera.target = [target[0], value, target[2]];
        if (axis === "targetZ") activeCamera.target = [target[0], target[1], value];

        activeCamera.viewMatrix = activeCamera.computeViewMatrix(); // Recompute view matrix after target change
      }
    });
  });

  // UI Controls for Camera Up Vector
  ["upX", "upY", "upZ"].forEach((axis) => {
    document.getElementById(axis).addEventListener("input", (event) => {
      const value = getInputValue(event);
      if (value !== null) {
        const up = activeCamera.up;
        if (axis === "upX") activeCamera.up = [value, up[1], up[2]];
        if (axis === "upY") activeCamera.up = [up[0], value, up[2]];
        if (axis === "upZ") activeCamera.up = [up[0], up[1], value];

        activeCamera.viewMatrix = activeCamera.computeViewMatrix(); // Recompute view matrix after up vector change
      }
    });
  });

  // Render loop
  let t = 0;

  function drawScene(timestamp) {
    t += 0.01;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.7, 0.7, 0.7, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const viewMatrix = activeCamera.getViewMatrix();
    const projectionMatrix = activeCamera.getProjectionMatrix();

    // Draw the scene
    gl.useProgram(program);
    city.update(timestamp);
    city.draw(program, viewMatrix, projectionMatrix);

    gl.useProgram(sky_program);
    globe.update(timestamp);
    globe.draw(sky_program, viewMatrix, projectionMatrix);

    if (activeCamera && animateCamera) {
      const pos = activeCamera.position;
      pos[0] = Math.sin(t) * 5.14;
      pos[2] = Math.sin(t * 0.1) * 20 + Math.cos(t * 0.1) * 10.14;
      pos[1] = 5. + Math.abs(Math.cos(t) * 1.14);
      activeCamera.updatePosition(pos[0], pos[1], pos[2]);
    }

    window.requestAnimationFrame(drawScene);
  }

  // Start animation
  drawScene();
});