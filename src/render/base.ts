import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let domElement: HTMLElement;

export const renderer = new THREE.WebGLRenderer();
export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);

export const controls = new OrbitControls(camera, renderer.domElement);

function updateRendererToDom() {
    renderer.setSize(domElement.clientWidth, domElement.clientHeight);
    camera.aspect = domElement.clientWidth / domElement.clientHeight;
    camera.updateProjectionMatrix();
}
window.addEventListener("resize", updateRendererToDom);

export function setDomElement(element: HTMLElement) {
    element.appendChild(renderer.domElement);
    domElement = element;
    updateRendererToDom();
}

export { THREE };
