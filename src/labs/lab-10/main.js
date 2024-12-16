import { compileShader, initCanvas, linkProgram } from 'mv-redux/init';
import { vec3, radians, lookAtMatrix, perspectiveMatrix } from 'mv-redux';

import vertSourceTex from './shaders/textured.vert';
import fragSourceTex from './shaders/textured.frag';
import vertSourceColor from './shaders/colored.vert';
import fragSourceColor from './shaders/colored.frag';

import { Shape } from './shape';
import { palette } from './palette';
import { makeBoxMesh, makePyramidMesh } from './meshes';
import { menu } from './menu';

// ------------------------------
// Initialize WebGL context and settings
const canvas = document.querySelector('canvas');
const gl = initCanvas(canvas);

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.4, 0.4, 0.4, 1.0); // Default clear color
gl.enable(gl.DEPTH_TEST);

// ------------------------------
// Compile shaders and link programs
const vsTex = compileShader(gl, gl.VERTEX_SHADER, vertSourceTex);
const fsTex = compileShader(gl, gl.FRAGMENT_SHADER, fragSourceTex);
const programTex = linkProgram(gl, vsTex, fsTex);

const vsColor = compileShader(gl, gl.VERTEX_SHADER, vertSourceColor);
const fsColor = compileShader(gl, gl.FRAGMENT_SHADER, fragSourceColor);
const programColor = linkProgram(gl, vsColor, fsColor);

const uLocationsTex = {
    uModel: gl.getUniformLocation(programTex, 'uModel'),
    uView: gl.getUniformLocation(programTex, 'uView'),
    uProj: gl.getUniformLocation(programTex, 'uProj'),
};

const uLocationsColor = {
    uModel: gl.getUniformLocation(programColor, 'uModel'),
    uView: gl.getUniformLocation(programColor, 'uView'),
    uProj: gl.getUniformLocation(programColor, 'uProj'),
};

// ------------------------------
// Initialize shapes and meshes
const meshCube = makeBoxMesh(gl, 1, 1, 1, palette.slice(1));
const meshPyr4 = makePyramidMesh(gl, 4, 1, 1, palette.slice(3));
const meshPyr3 = makePyramidMesh(gl, 3, 1, 1, palette.slice(0));

const mainCube = new Shape(meshCube);
const shapeCollection = [
    new Shape(meshCube, { position: vec3(-1.60, +0.50, -1.20), rotation: vec3(0.00, +0.700, +0.000), scale: vec3(1) }),
    new Shape(meshCube, { position: vec3(+2.72, +0.50, -1.44), rotation: vec3(0.00, +2.000, +0.000), scale: vec3(1) }),
    new Shape(meshCube, { position: vec3(+0.80, +0.50, -3.36), rotation: vec3(3.14, +3.140, +0.000), scale: vec3(2.5, 1, 1) }),
    new Shape(meshPyr4, { position: vec3(+0.80, +0.00, +3.20), rotation: vec3(0.00, +0.000, +0.000), scale: vec3(0.5, 2, 0.5) }),
    new Shape(meshPyr4, { position: vec3(-0.80, +0.00, +1.60), rotation: vec3(0.00, +1.200, +0.000), scale: vec3(0.5, 0.3, 0.5) }),
    new Shape(meshPyr4, { position: vec3(+0.72, +0.338, 1.84), rotation: vec3(0.00, +0.785, -1.858), scale: vec3(0.5, 1.2, 0.5) }),
    new Shape(meshPyr3, { position: vec3(+0.14, +0.00, -1.76), rotation: vec3(0.00, +2.220, +0.000), scale: vec3(0.5) }),
    new Shape(meshPyr3, { position: vec3(+0.45, +0.00, +0.00), rotation: vec3(0.00, -1.570, +0.000), scale: vec3(0.35) }),
];

// =================================================================================================
// Step 1: Setting up the framebuffer
// =================================================================================================


const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);


gl.texImage2D( 
    gl.TEXTURE_2D,
    0, // Mipmap level
    gl.RGBA, // Internal format
    1024, 1024, // Width, Height
    0, // Border (must be 0 in WebGL)
    gl.RGBA, // Format
    gl.UNSIGNED_BYTE, // Type
    null // "No data, just allocate empty space"
);


gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);


const framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);


gl.framebufferTexture2D(
    gl.FRAMEBUFFER, // Target
    gl.COLOR_ATTACHMENT0, // Attachment point
    gl.TEXTURE_2D, // Texture target
    texture, // Texture object
    0 // Mipmap level
);

// 4
const depthBuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1024, 1024);
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);


gl.bindFramebuffer(gl.FRAMEBUFFER, null);

// =================================================================================================
// Step 2: Rendering into the framebuffer
// =================================================================================================

function draw(time = 0) {
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, 1024, 1024); 
    gl.clearColor(0.4, 0.4, 0.4, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawShapeCollection(time); 

    
    // good to have in general review!
    //gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.generateMipmap(gl.TEXTURE_2D);

   
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height); 
    gl.clearColor(0.6, 0.6, 0.4, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawMainCube(time); 

    window.requestAnimationFrame(draw);
}

/**
 * Draws a collection of shapes.
 */
function drawShapeCollection(time = 0) {
    gl.useProgram(programColor);

    const camRadius = 5.0;
    const camSpeed = 2.0;

    const camX = camRadius * Math.sin(-time / 10_000 * camSpeed);
    const camZ = camRadius * Math.cos(-time / 10_000 * camSpeed);
    const cameraPosition = vec3(camX, 2.0, camZ);

    const viewMatrix = lookAtMatrix(cameraPosition, vec3(0, 0.5, 0));
    const projMatrix = perspectiveMatrix(radians(45), canvas.width / canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(uLocationsColor.uView, false, viewMatrix.flat());
    gl.uniformMatrix4fv(uLocationsColor.uProj, false, projMatrix.flat());

    for (const shape of shapeCollection) {
        gl.uniformMatrix4fv(uLocationsColor.uModel, false, shape.getModelMatrix().flat());
        shape.mesh.draw();
    }
}

/**
 * Draws a single cube in the middle of the scene.
 */
function drawMainCube(time = 0) {
    gl.useProgram(programTex);

    const azimuth = radians(menu.azimuth.valueAsNumber);
    const altitude = radians(menu.altitude.valueAsNumber);
    const radius = menu.radius.valueAsNumber;
    const camPos = vec3(
        radius * Math.sin(azimuth) * Math.cos(altitude),
        radius * Math.sin(altitude),
        radius * Math.cos(azimuth) * Math.cos(altitude),
    );

    const viewMatrix = lookAtMatrix(camPos, vec3(0, 0, 0));
    const projMatrix = perspectiveMatrix(radians(45), canvas.width / canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(uLocationsTex.uView, false, viewMatrix.flat());
    gl.uniformMatrix4fv(uLocationsTex.uProj, false, projMatrix.flat());

    gl.uniformMatrix4fv(uLocationsTex.uModel, false, mainCube.getModelMatrix().flat());
    mainCube.mesh.draw();
}

// Start rendering
draw();
