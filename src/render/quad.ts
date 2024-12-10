import { Mesh, MeshBasicMaterial, PlaneGeometry, TextureLoader } from "three";

export type Quad = {
    meshes: {
        quad: Mesh<PlaneGeometry, MeshBasicMaterial>;
        point: Mesh<PlaneGeometry, MeshBasicMaterial>;
    };
    width: number;
    height: number;
};

const quadGeometry = new PlaneGeometry(1, 1);
const loader = new TextureLoader();

const pointSize = 0.25;

// Loads an image and puts it in a quad, with its size
// If the image is not found, returns null instead
export async function newQuad(
    imageUrl: string,
    scale: number,
    size?: { width: number; height: number },
): Promise<Quad | null> {
    const texture = await loader.loadAsync(imageUrl).catch(() => null);
    if (texture === null) return null;

    const material = new MeshBasicMaterial({ map: texture });
    const color = new MeshBasicMaterial({ color: 0xff0000 });
    const quad = new Mesh(quadGeometry, material);
    const point = new Mesh(quadGeometry, color);

    const width = size ? size.width : texture.image.width;
    const height = size ? size.height : texture.image.height;
    quad.scale.set(width * scale, height * scale, scale);
    point.scale.set(pointSize, pointSize, pointSize);

    return { meshes: { quad, point }, width, height };
}
