export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return response.json() as T;
}
