import { Mesh, MeshBasicMaterial, PlaneGeometry, TextureLoader } from "three";

export type Quad = {
    quad: Mesh<PlaneGeometry, MeshBasicMaterial>;
    width: number;
    height: number;
};

const quadGeometry = new PlaneGeometry(1, 1);
const loader = new TextureLoader();

// Loads an image and puts it in a quad, with its size
// If the image is not found, returns null instead
export async function newQuad(
    imageUrl: string,
    scale: number,
): Promise<Quad | null> {
    const texture = await loader.loadAsync(imageUrl).catch(() => null);
    if (texture === null) return null;

    const material = new MeshBasicMaterial({ map: texture });
    const quad = new Mesh(quadGeometry, material);

    const width = texture.image.width;
    const height = texture.image.height;
    quad.scale.set(width * scale, height * scale, scale);

    return { quad, width, height };
}
