import styles from "./main.scss";

export class Delta {
    public readonly element: Element;

    private _value: number = 0.00;
    private _percentValue: number | undefined = undefined;
    private readonly arrowElement: HTMLElement;

    constructor(value?: number, percentValue?: number) {
        value = value ?? 0;

        this.arrowElement = document.createElement("span");

        this.element = document.createElement("div");
        this.element.className = styles.delta;
        this.element.appendChild(this.arrowElement);
        this.element.appendChild(document.createTextNode(Delta.displayString(value, percentValue)));

        this.value = value;
        this._percentValue = percentValue;
    }

    public set value(value: number) {
        this._value = value;

        this.element.childNodes[1].textContent = Delta.displayString(this._value, this._percentValue);

        const valueClass = this._value > 0 ? "positive" : (this._value < 0 ? "negative" : "dark");
        if (!this.element.classList.contains(valueClass)) {
            this.element.classList.remove("positive", "negative", "dark");
            this.element.classList.add(valueClass);
        }

        const valueDelta = this._value - this._value;
        this.arrowElement.className = "";
        void this.arrowElement.offsetWidth;
        this.arrowElement.className = styles[valueDelta > 0 ? "arrowSignPositive" : "arrowSignNegative"];
    }

    public set percentValue(percentValue: number | undefined) {
        this._percentValue = percentValue;
        this.element.childNodes[1].textContent = Delta.displayString(this._value, this._percentValue);
    }

    private static displayString(value: number, percentValue?: number) {
        let s = value == 0 ? "-" : value.toFixed(2);
        if (percentValue && value != 0)
            s += ` (${percentValue.toFixed(2)}%)`;
        return s;
    }
}