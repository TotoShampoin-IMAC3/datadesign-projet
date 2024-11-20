import "./style.css";
import {
    setDomElement,
    scene,
    camera,
    renderer,
    controls,
} from "./render/base";
import { quads, newQuad } from "./render/quad";

const $app = document.getElementById("app")!;
setDomElement($app);
controls.enableDamping = true;

const COUNT = 1000;

for (let i = 0; i < COUNT; i++) {
    const url = `/dataset/images/image_${i}.jpg`;
    newQuad(url, 1 / 1000).then((quad) => {
        quad.position.set(
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
        );
        scene.add(quad);
    });
}

camera.position.z = 5;

renderer.setAnimationLoop(() => {
    quads.forEach((quad) => {
        quad.quaternion.copy(camera.quaternion);
    });

    renderer.render(scene, camera);
    controls.update();
});
