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
import { delay } from "./utils";

// ===== Renderer initialization
const $app = document.getElementById("app")!;
setRenderDomElement($app);
setHudDomElement($app);

// ===== Camera and controls initialization
controls.enableDamping = true;
controls.dampingFactor = 0.1;
camera.position.z = 20;

const NB_QUADS = 1000;

// ===== Crude loading progress
let counter = 0;
let maxCounter = NB_QUADS;
function updateLoadingText() {
    setText(`Loading: ${counter}/${maxCounter}`);
    if (counter === maxCounter) {
        setText(`Loading: ${counter}/${maxCounter} - Done`);
    }
}

// ===== Quads loading
const quads: Quad[] = [];
for (let i = 0; i < NB_QUADS; i++) {
    newQuad(`/dataset/images/image_${i}.jpg`, 1 / 2000) //
        .then(async (data) => {
            // If the image is not found, we reduce the counter
            if (data === null) {
                maxCounter--;
                return;
            }
            counter++;
            updateLoadingText();
            data.quad.position.set(
                Math.random() * 10 - 5,
                Math.random() * 10 - 5,
                Math.random() * 10 - 5,
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
        if (i % 10 === 0) await delay(0);
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
