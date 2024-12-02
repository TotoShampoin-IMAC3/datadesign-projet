import "./style.css";
import {
    setDomElement as setRenderDomElement,
    scene,
    camera,
    renderer,
    controls,
    THREE,
} from "./render/base";
import {
    setDomElement as setHudDomElement,
    setLoading,
    onModeChange,
} from "./hud/base";
import { newQuad, Quad } from "./render/quad";
import { delay, fetchJson, hsvToHsl } from "./utils";
import BezierEasing from "bezier-easing";

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
camera.position.z = 50;

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
// const NB_QUADS = 1000;

// ===== Crude loading progress
let counter = 0;
let maxCounter = NB_QUADS;
function updateLoadingText() {
    setLoading((counter / maxCounter) * 100, `${counter}/${maxCounter}`);
}

const quads: { data: Quad; hsv_mean: number[]; hsv_max: number[] }[] = [];

// ===== Quads loading
let i = 0;
for (const d of data) {
    const { name, width, height } = d;
    const { h_max, s_max, v_max, h_mean, s_mean, v_mean } = d;

    // This is a trick to avoid caching the images
    // because for some reason, cached images crash the website
    const random = `${Math.floor(Math.random() * 10 ** 16)}`;
    const url = `/parsed/${name}?anti-cache=${random}`;

    newQuad(url, 1 / 2000, { width, height }) //
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

            scene.add(data.quad);
        });
}

type Mode = "images-mean" | "images-max" | "cloud-mean" | "cloud-max";

let lerpTimer = 0;
let modeFrom = "images-max" as Mode;
let modeTo = "images-mean" as Mode;

onModeChange<Mode>((mode) => {
    lerpTimer = 1;
    modeFrom = modeTo;
    modeTo = mode;
});

const easing = BezierEasing(0.5, 0, 0.5, 1);

let lastTime = 0;
// ===== Rendering loop
renderer.setAnimationLoop((time) => {
    const deltaTime = time - lastTime;

    quads.forEach((data) => {
        const { hsv_mean, hsv_max, data: quad } = data;

        const hFrom = modeFrom.includes("mean") ? hsv_max[0] : hsv_mean[0];
        const sFrom = modeFrom.includes("mean") ? hsv_max[1] : hsv_mean[1];
        const vFrom = modeFrom.includes("mean") ? hsv_max[2] : hsv_mean[2];
        const rFrom = modeFrom.includes("mean") ? 20 : 40;
        const hTo = modeTo.includes("mean") ? hsv_max[0] : hsv_mean[0];
        const sTo = modeTo.includes("mean") ? hsv_max[1] : hsv_mean[1];
        const vTo = modeTo.includes("mean") ? hsv_max[2] : hsv_mean[2];
        const rTo = modeTo.includes("mean") ? 20 : 40;

        // const t = lerp(0, 1, lerpTimer);
        // const t = smoothstep(0, 1, lerpTimer);
        const t = easing(lerpTimer);
        const h = lerp(hFrom, hTo, t);
        const s = lerp(sFrom, sTo, t);
        const v = lerp(vFrom, vTo, t); // ** (1 / 2.2);
        const r = lerp(rFrom, rTo, t);

        quad.quad.position.set(
            Math.cos(h * Math.PI * 2) * s * r,
            (v * 2 - 1) * r,
            Math.sin(h * Math.PI * 2) * s * r,
        );
        quad.quad.quaternion.copy(camera.quaternion);
    });

    controls.update();

    const pos = camera.position.clone().normalize();
    const [x, y, z] = pos.toArray();
    const hsv = [(Math.atan2(z, x) / Math.PI / 2 + 1) % 1, (y + 1) / 2, 0.2];
    let hsl = hsvToHsl(hsv[0], hsv[1], hsv[2]);

    renderer.setClearColor(
        new THREE.Color(
            `hsl(${hsl[0] * 360}, ${hsl[1] * 100}%, ${hsl[2] * 100}%)`,
        ),
    );

    renderer.render(scene, camera);

    if (lerpTimer - deltaTime / 1000 > 0) lerpTimer -= deltaTime / 1000;
    else lerpTimer = 0;

    lastTime = time;
});
