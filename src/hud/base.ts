import titleHtml from "./title.html?raw";
import hudHtml from "./hud.html?raw";
import legendHtml from "./legend.html?raw";
import explainHtml from "./explain.html?raw";

const $title = document.createElement("div");
$title.innerHTML = titleHtml;

const $hud = document.createElement("div");
$hud.innerHTML = hudHtml;

const $legend = document.createElement("div");
$legend.innerHTML = legendHtml;

const $explain = document.createElement("div");
$explain.innerHTML = explainHtml;
const $explainDiv = $explain.children[0] as HTMLDivElement;

const $loadingBox = $legend.querySelector("#loading-box") as HTMLDivElement;
const $loadingBar = $legend.querySelector(
    "#loading-bar",
) as HTMLProgressElement;
const $loadingText = $legend.querySelector("#loading-text") as HTMLSpanElement;
const $top = $hud.querySelector("#top") as HTMLButtonElement;
const side = $hud.querySelector("#side") as HTMLButtonElement;
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
export function onTopClick(callback: () => void) {
    $top.addEventListener("click", callback);
}
export function onSideClick(callback: () => void) {
    side.addEventListener("click", callback);
}

export function setLoading(
    value: number,
    text: string = `${value.toFixed(1)}%`,
) {
    $loadingText.innerText = text;
    $loadingBar.value = value;
}
export function hideLoading() {
    $loadingBox.classList.add("hidden");
}

type ExplainMode = "images" | "cloud";
export function setExplain(mode: ExplainMode) {
    $explainDiv.dataset.mode = mode;
}

export function setDomElement(element: HTMLElement) {
    element.appendChild($title.children[0]);
    element.appendChild($hud.children[0]);
    element.appendChild($legend.children[0]);
    element.appendChild($explain.children[0]);

    const $toggle = document.querySelectorAll(
        ".toggle",
    ) as NodeListOf<HTMLButtonElement>;
    $toggle.forEach((button) => {
        button.addEventListener("click", () => {
            const targetSelector = button.dataset.for;
            const target = document.querySelector(
                `[data-target=${targetSelector}]`,
            );
            if (target) {
                target.classList.toggle("hidden");
            }
        });
    });
}
