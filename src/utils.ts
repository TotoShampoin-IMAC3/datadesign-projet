export function urlExists(url: string) {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("HEAD", url, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                resolve(xhr.status === 200);
            }
        };
        xhr.send();
    });
}

export function delat(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
