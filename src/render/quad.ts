import {
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    TextureLoader,
    Texture,
} from "three";
import * as THREE from "three";

export type Quad = Mesh<
    PlaneGeometry,
    MeshBasicMaterial,
    THREE.Object3DEventMap
>;

const quadGeometry = new PlaneGeometry(1, 1);
const loader = new TextureLoader();

// Placeholder texture (can be a solid color or a loading image)
const placeholderTexture = new Texture(); // You can set a specific texture here

export async function newQuad(
    imageUrl: string,
    scale: number,
): Promise<{ quad: Quad; width: number; height: number } | null> {
    const material = new MeshBasicMaterial({ map: placeholderTexture });
    const quad = new Mesh(quadGeometry, material);

    const texture = await loader.loadAsync(imageUrl).catch(() => null);
    if (texture === null) return null;

    material.map = texture;
    material.needsUpdate = true;

    const width = texture.image.width;
    const height = texture.image.height;
    quad.scale.set(width * scale, height * scale, scale);

    return { quad, width, height };
}
