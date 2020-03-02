import styles from "./main.scss";

export class CellDelta {
    public readonly element: Element;

    private _value: number = 0.00;
    private readonly arrowElement: HTMLElement;

    constructor(value?: number) {
        value = value ?? 0;

        this.arrowElement = document.createElement("span");

        this.element = document.createElement("div");
        this.element.className = styles.delta;
        this.element.appendChild(this.arrowElement);
        this.element.appendChild(document.createTextNode("0.00"));

        this.value = value;
    }

    public set value(value: number) {
        this.element.childNodes[1].textContent = value == 0 ? "-" : value.toFixed(2);

        const valueClass = value > 0 ? "positive" : (value < 0 ? "negative" : "dark");
        if (!this.element.classList.contains(valueClass)) {
            this.element.classList.remove("positive", "negative", "dark");
            this.element.classList.add(valueClass);
        }

        const valueDelta = value - this._value;
        this.arrowElement.className = "";
        void this.arrowElement.offsetWidth;
        this.arrowElement.className = styles[valueDelta > 0 ? "arrowSignPositive" : "arrowSignNegative"];

        this._value = value;
    }
}