import titleHtml from "./title.html?raw";
import hudHtml from "./hud.html?raw";

const $title = document.createElement("div");
$title.innerHTML = titleHtml;

const $hud = document.createElement("div");
$hud.innerHTML = hudHtml;

const $loading = $hud.querySelector("#loading") as HTMLProgressElement;
const $loadingText = $hud.querySelector("#loading-text") as HTMLSpanElement;
const $mode = $hud.querySelectorAll(
    "input[name=mode]",
) as NodeListOf<HTMLInputElement>;
const $disp = $hud.querySelectorAll(
    "input[name=disp]",
) as NodeListOf<HTMLInputElement>;

export function onModeChange<T = string>(callback: (mode: T) => void) {
    $mode.forEach((input) =>
        input.addEventListener("change", () => {
            callback(input.value as T);
        }),
    );
}
export function onDispChange<T = string>(callback: (disp: T) => void) {
    $disp.forEach((input) =>
        input.addEventListener("change", () => {
            callback(input.value as T);
        }),
    );
}

export function setLoading(
    value: number,
    text: string = `${value.toFixed(1)}%`,
) {
    $loadingText.innerText = text;
    $loading.value = value;
}

export function setDomElement(element: HTMLElement) {
    element.appendChild($title.children[0]);
    element.appendChild($hud.children[0]);
}
