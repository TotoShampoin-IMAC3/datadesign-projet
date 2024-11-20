import { Mesh, MeshBasicMaterial, PlaneGeometry, TextureLoader } from "three";

export const quads: Mesh[] = [];

const quadGeometry = new PlaneGeometry(1, 1);

const loader = new TextureLoader();

export async function newQuad(imageUrl: string, scale: number): Promise<Mesh> {
    const image = new Image();
    image.src = imageUrl;
    await new Promise((resolve) => {
        image.onload = resolve;
    });
    const width = image.width;
    const height = image.height;

    const material = new MeshBasicMaterial({
        map: loader.load(imageUrl),
    });
    const quad = new Mesh(quadGeometry, material);
    quads.push(quad);

    quad.scale.set(width * scale, height * scale, scale);

    return quad;
}
