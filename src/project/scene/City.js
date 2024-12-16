// Room.js

import {
  SceneObject
} from "./SceneObject.js";
import {
  Cube
} from "./Cube.js";

export class City extends SceneObject {
  constructor(gl, citySize = 10, blockSpacing = 0.1) {
    super();
    this.gl = gl;
    this.citySize = citySize;
    this.blockSpacing = blockSpacing;
    this.buildings = [];
    this.buildingPositions = [];

    this.initGround(100);
    this.initCity();
  }

  // Initialize the ground for the city
  initGround(citySize) {
    const ground = new Cube(this.gl, citySize, 0.1, citySize, [0.7, 0.7, 0.7]);
    ground.position = [0, -0.1, 0];
    this.addChild(ground);
  }

  // Initialize the city with buildings and roads
  initCity() {
    const roadWidth = 2;
    const blockSize = 3.0;
    const numBlocks = 10;
    const spacing = 0.1;
    const citySize = numBlocks * (blockSize + roadWidth);
    const centerOffset = citySize / 2;

    for (let x = 0; x < numBlocks; x++) {
      const blockXPos = x * (blockSize + roadWidth) - centerOffset;

      for (let z = 0; z < numBlocks; z++) {
        const blockZPos = z * (blockSize + roadWidth) - centerOffset;

        if (z === 0) {
          this.createRoad(blockXPos - roadWidth * 0.68, z, roadWidth / 2, citySize, 0.01);
        }
        if (x === 0) {
          this.createRoad(x, blockZPos - roadWidth * 0.68, citySize, roadWidth / 2, 0);
        }

        this.createBuildingsInBlock(blockXPos, blockZPos, blockSize, spacing);
      }
    }
  }

  // Create roads
  createRoad(x, z, width, length, offset) {
    const road = new Cube(this.gl, width, 0.1, length, [0.2, 0.2, 0.2]);
    road.position = [x, offset, z];
    this.addChild(road);
    this.buildings.push(road);
  }

  // Create tightly packed buildings within a block
  createBuildingsInBlock(blockXPos, blockZPos, blockSize, spacing) {
    let offsetX = 0;
    let offsetZ = 0;
    const numBuildingsX = Math.floor(blockSize / 1.0);
    const numBuildingsZ = Math.floor(blockSize / 1.0);

    for (let i = 0; i < numBuildingsX; i++) {
      for (let j = 0; j < numBuildingsZ; j++) {
        if (Math.random() < 0.3) continue; // Skip some buildings randomly

        const height = Math.random() * 2.5 + 1.0;
        const width = 1.0;
        const depth = 1.0;
        const color = [Math.random(), Math.random(), Math.random()];

        const buildingXPos = blockXPos + offsetX;
        const buildingZPos = blockZPos + offsetZ;

        const building = new Cube(this.gl, width, height, depth, color);
        building.position = [buildingXPos, height / 2, buildingZPos];

        this.addChild(building);
        this.buildings.push(building);
        this.buildingPositions.push(building.position);

        offsetX += width + spacing;
      }

      offsetZ += 1.0 + spacing;
      offsetX = 0;
    }
  }

  // Check for collisions between buildings
  checkCollision(building) {
    const [bx, by, bz] = building.position;

    for (const [existingX, existingY, existingZ] of this.buildingPositions) {
      const distance = Math.sqrt(
        (bx - existingX) ** 2 + (by - existingY) ** 2 + (bz - existingZ) ** 2
      );

      if (distance < building.width / 2 + this.buildings[i].width / 2) {
        return true;
      }
    }
    return false;
  }

  // Draw all elements
  draw(program, viewMatrix, projectionMatrix) {
    this.children.forEach((child) => child.draw(program, viewMatrix, projectionMatrix));
  }

  // Update all elements
  update(timestamp) {
    this.updateModelMatrix();
    this.children.forEach((child) => child.update(timestamp));
  }
}