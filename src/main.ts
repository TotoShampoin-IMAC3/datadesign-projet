import "./style.css";
import {
    setDomElement as setRenderDomElement,
    scene,
    camera,
    renderer,
    controls,
} from "./render/base";
import { setDomElement as setHudDomElement, setText } from "./hud/base";
import { newQuad, Quad } from "./render/quad";
import { delay, fetchJson } from "./utils";

// ===== Renderer initialization
const $app = document.getElementById("app")!;
setRenderDomElement($app);
setHudDomElement($app);

// ===== Camera and controls initialization
controls.enableDamping = true;
controls.dampingFactor = 0.1;
camera.position.z = 20;

// const NB_QUADS = 1000;
const data = await fetchJson<
    {
        name: string;
        width: number;
        height: number;
        h: number;
        s: number;
        v: number;
    }[]
>("/data.json");
const NB_QUADS = data.length;

// ===== Crude loading progress
let counter = 0;
let maxCounter = NB_QUADS;
function updateLoadingText() {
    setText(`Loading: ${counter}/${maxCounter}`);
    if (counter === maxCounter) {
        setText(`Loading: ${counter}/${maxCounter} - Done`);
    }
}

const quads: Quad[] = [];

// ===== Quads loading
// for (let i = 0; i < NB_QUADS; i++) {
//     newQuad(`/dataset/images/image_${i}.jpg`, 1 / 2000) //
for (const { name, width, height, h, s, v } of data) {
    newQuad(`/parsed/${name}`, 1 / 2000, { width, height }) //
        .then(async (data) => {
            // If the image is not found, we reduce the counter
            if (data === null) {
                throw new Error("Image not found");
            }
            counter++;
            updateLoadingText();
            data.quad.position.set(
                Math.cos(h * Math.PI * 2) * s * 20,
                (v * 2 - 1) * 15,
                Math.sin(h * Math.PI * 2) * s * 20,
            );
            quads.push(data);

            if (counter === maxCounter) {
                texturesLoaded();
            }
        });
}

// Once all quads are loaded, we add them to the scene
// We sort them from biggest to smallest in batches (delay(0) slows down the loop)
// to avoid lags during loading time
async function texturesLoaded() {
    quads.sort((a, b) => {
        return b.width * b.height - a.width * a.height;
    });
    for (let i = 0; i < quads.length; i++) {
        const { quad } = quads[i];
        scene.add(quad);
        // if (i % 10 === 0) await delay(0);
    }
}

// ===== Rendering loop
renderer.setAnimationLoop(() => {
    quads.forEach((data) => {
        data.quad.quaternion.copy(camera.quaternion);
    });

    renderer.render(scene, camera);
    controls.update();
});
