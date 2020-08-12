import styles from "./main.scss";

export type Mode = "neutral" | "positiveNegative";

export class Delta {
    public readonly element: Element;
    public readonly textNode: Text;

    private readonly mode: Mode;
    private _value: number = 0.00;
    private _percentValue: number | undefined = undefined;
    private readonly arrowElement: HTMLElement | undefined;

    constructor({ value = 0.00, percentValue, mode = "positiveNegative" }: { value?: number; percentValue?: number; mode?: Mode; } = {}) {
        this.element = document.createElement("div");
        this.element.className = styles.delta;
        if (this.mode === "positiveNegative")
            this.element.appendChild(this.arrowElement = document.createElement("span"));
        this.element.appendChild(this.textNode = document.createTextNode(""));

        this.mode = mode;
        this.value = value;
        this.percentValue = percentValue;
    }

    public set value(value: number) {
        const valueDelta = value - this._value;
        this._value = value;

        this.textNode.textContent = Delta.displayString(this._value, this._percentValue, this.mode);

        if (this.mode === "positiveNegative") {
            this.element.classList.toggle("positive", this._value > 0);
            this.element.classList.toggle("negative", this._value < 0);

            if (this.arrowElement) {
                this.arrowElement.className = "";
                void this.arrowElement.offsetWidth;
                this.arrowElement.className = styles[valueDelta > 0 ? "arrowSignPositive" : "arrowSignNegative"];
            }
        }
    }

    public set percentValue(percentValue: number | undefined) {
        this._percentValue = percentValue;
        this.textNode.textContent = Delta.displayString(this._value, this._percentValue, this.mode);
    }

    private static displayString(value: number, percentValue: number | undefined, mode: Mode) {
        let s = value == 0 ? "-" : value.toFixed(2);
        if (value > 0 && mode === "neutral")
            s = "+" + s;
        if (percentValue && value != 0)
            s += ` (${percentValue.toFixed(2)}%)`;
        return s;
    }
}