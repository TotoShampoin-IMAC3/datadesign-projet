import "./style.css";
import {
    setDomElement as setRenderDomElement,
    scene,
    camera,
    renderer,
    controls,
    THREE,
} from "./render/base";
import { setDomElement as setHudDomElement, setText } from "./hud/base";
import { newQuad, Quad } from "./render/quad";
import { delay, fetchJson } from "./utils";

function lerp(a: number, b: number, t: number) {
    return a * (1 - t) + b * t;
}

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
        h_mean: number;
        s_mean: number;
        v_mean: number;
        h_max: number;
        s_max: number;
        v_max: number;
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

const quads: { data: Quad; hsv_mean: number[]; hsv_max: number[] }[] = [];

// ===== Quads loading
// for (let i = 0; i < NB_QUADS; i++) {
//     newQuad(`/dataset/images/image_${i}.jpg`, 1 / 2000) //
for (const d of data) {
    const { name, width, height } = d;
    const { h_max, s_max, v_max, h_mean, s_mean, v_mean } = d;
    newQuad(`/parsed/${name}`, 1 / 2000, { width, height }) //
        .then(async (data) => {
            // If the image is not found, we reduce the counter
            if (data === null) {
                throw new Error("Image not found");
            }
            counter++;
            updateLoadingText();
            quads.push({
                data: data,
                hsv_max: [h_max, s_max, v_max],
                hsv_mean: [h_mean, s_mean, v_mean],
            });

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
        return b.data.width * b.data.height - a.data.width * a.data.height;
    });
    for (let i = 0; i < quads.length; i++) {
        const { data: quad } = quads[i];
        scene.add(quad.quad);
        // if (i % 10 === 0) await delay(0);
    }
}

(window as any).lerpTimer = 1;
(window as any).lerpFrom = 0;
(window as any).lerpTo = 1;

let lastTime = 0;
// ===== Rendering loop
renderer.setAnimationLoop((time) => {
    const deltaTime = time - lastTime;

    quads.forEach((data) => {
        const { hsv_mean, hsv_max, data: quad } = data;
        const t = lerp(
            (window as any).lerpFrom,
            (window as any).lerpTo,
            (window as any).lerpTimer,
        );
        const h = lerp(hsv_mean[0], hsv_max[0], t);
        const s = lerp(hsv_mean[1], hsv_max[1], t);
        const v = lerp(hsv_mean[2], hsv_max[2], t);
        quad.quad.position.set(
            Math.cos(h * Math.PI * 2) * s * 20,
            (v * 2 - 1) * 20,
            Math.sin(h * Math.PI * 2) * s * 20,
        );
        quad.quad.quaternion.copy(camera.quaternion);
    });

    renderer.render(scene, camera);
    controls.update();

    if ((window as any).lerpTimer > 0)
        (window as any).lerpTimer -= deltaTime / 1000;

    lastTime = time;
});
