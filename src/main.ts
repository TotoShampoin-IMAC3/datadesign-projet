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
import { delat as delay } from "./utils";

const $app = document.getElementById("app")!;
setRenderDomElement($app);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

setHudDomElement($app);

// I would download the 10000, but they need to be shrunk first, to reduce RAM usage
const COUNT = 1000;

let counter = 0;
let maxCounter = COUNT;
function updateLoadingText() {
    counter++;
    setText(`Loading: ${counter}/${maxCounter}`);
}

const quads: {
    quad: Quad;
    width: number;
    height: number;
}[] = [];
for (let i = 0; i < COUNT; i++) {
    newQuad(`/dataset/images/image_${i}.jpg`, 1 / 2000).then(async (data) => {
        if (data === null) {
            maxCounter--;
            return;
        }
        updateLoadingText();
        data.quad.position.set(
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
        );
        // scene.add(quad);
        quads.push(data);

        if (counter === maxCounter) {
            texturesLoaded();
        }
    });
}
async function texturesLoaded() {
    quads.sort((a, b) => {
        // return a.width * a.height - b.width * b.height;
        return b.width * b.height - a.width * a.height;
    });
    for (let i = 0; i < quads.length; i++) {
        const { quad } = quads[i];
        scene.add(quad);
        if (i % 10 === 0) await delay(0);
    }
}

console.log(`Quads created: ${quads.length}`);

camera.position.z = 20;

renderer.setAnimationLoop(() => {
    quads.forEach((data) => {
        data.quad.quaternion.copy(camera.quaternion);
    });

    renderer.render(scene, camera);
    controls.update();
});
