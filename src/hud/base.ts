const $hud = document.createElement("div");
$hud.classList.add("hud");

export function setText(text: string) {
    $hud.innerText = text;
}

export function setDomElement(element: HTMLElement) {
    element.appendChild($hud);
}
