import { Renderer } from "./components/Renderer.js";

window.onload = () => {
  const canvas = document.getElementById("glCanvas");
  const uiElements = {
    posX: document.getElementById("posX"),
    posY: document.getElementById("posY"),
    posZ: document.getElementById("posZ"),
    rotX: document.getElementById("rotX"),
    rotY: document.getElementById("rotY"),
    rotZ: document.getElementById("rotZ"),
    scale: document.getElementById("scale"),
  };

  const renderer = new Renderer(canvas, uiElements);
  renderer.disableUI();
};
