export class CellDelta {
    public readonly element: Element;

    constructor(value?: number) {
        value = value ?? 0;

        this.element = document.createElement("div");

        const arrow = document.createElement("span");
        arrow.className = "arrow-sign";
        this.element.appendChild(arrow);
        this.element.appendChild(document.createTextNode("0.00"));

        this.value = value;
    }

    public set value(value: number) {
        this.element.childNodes[1].textContent = value.toFixed(2);
        this.element.className = value >= 0 ? "positive" : "negative";
    }
}